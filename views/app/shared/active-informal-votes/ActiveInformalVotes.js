import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import * as Icon from "react-feather";
import Tooltip from "@material-ui/core/Tooltip";
import {
  GlobalRelativeCanvasComponent,
  UnvotedFilter,
} from "../../../../components";
import {
  getActiveInformalVotes,
  saveUnvotedInformal,
} from "../../../../utils/Thunk";
import {
  saveUser,
  setActiveModal,
  setCustomModalData,
  setInformalBallotTableStatus,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";
import { BALLOT_TYPES } from "../../../../utils/enum";

import "./active-informal-votes.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    informalBallotTableStatus: state.admin.informalBallotTableStatus,
    settings: state.global.settings,
  };
};

class ActiveInformalVotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      votes: [],
      totalUnvoted: 0,
      sort_key: "timeLeft",
      sort_direction: "asc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      show_unvoted: 0,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.startTracking();
    this.setState(
      {
        show_unvoted: this.props.authUser?.show_unvoted_informal,
      },
      () => {
        this.getVotes();
      }
    );
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { informalBallotTableStatus } = this.props;
    if (!prevProps.informalBallotTableStatus && informalBallotTableStatus) {
      this.reloadTable();
      this.props.dispatch(setInformalBallotTableStatus(false));
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById(
      "app-active-informal-votes-sectionBody"
    );
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (!this.$elem) return;
    if (
      this.$elem.scrollTop + this.$elem.clientHeight >=
      this.$elem.scrollHeight
    )
      this.runNextPage();
  };

  // Handle Search
  handleSearch = (e) => {
    this.setState({ search: e.target.value }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.reloadTable();
      }, 500);
    });
  };

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, votes: [], finished: false }, () => {
      this.getVotes();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getVotes(false);
    });
  }

  getVotes(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      votes,
      show_unvoted,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    if (show_unvoted) {
      params.show_unvoted = show_unvoted;
    }

    this.props.dispatch(
      getActiveInformalVotes(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.votes || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            votes: [...votes, ...result],
            totalUnvoted: res.total_unvoted,
          });
        }
      )
    );
  }

  clickRow(vote) {
    const { authUser, history } = this.props;
    if (!authUser.is_guest) {
      if (vote.milestone_id) {
        history.push(
          `/app/proposal/${vote.proposal_id}?milestone_id=${vote.milestone_id}`
        );
      } else {
        history.push(`/app/proposal/${vote.proposal_id}`);
      }
    } else {
      this.props.dispatch(
        setCustomModalData({
          "voting-access-alert": {
            render: true,
            title: "Sorry, you can't access a live vote.",
          },
        })
      );
      this.props.dispatch(setActiveModal("custom-global-modal"));
    }
  }

  renderTriangle(key) {
    const { sort_key, sort_direction } = this.state;
    if (sort_key != key) return <span className="inactive">&#9650;</span>;
    else {
      if (sort_direction == "asc") return <span>&#9650;</span>;
      else return <span>&#9660;</span>;
    }
  }

  clickHeader(key) {
    let { sort_key, sort_direction } = this.state;
    if (sort_key == key)
      sort_direction = sort_direction == "asc" ? "desc" : "asc";
    else {
      sort_key = key;
      sort_direction = "desc";
    }

    this.setState({ sort_key, sort_direction }, () => {
      this.reloadTable();
    });
  }

  renderQuorum(vote) {
    const { authUser, settings } = this.props;
    let quorumRate = 0;
    if (
      ["simple", "admin-grant", "advance-payment"].includes(vote.content_type)
    ) {
      quorumRate = +settings.quorum_rate_simple;
    } else if (vote.content_type === "grant") {
      quorumRate = +settings.quorum_rate;
    } else if (vote.content_type === "milestone") {
      quorumRate = +settings.quorum_rate_milestone;
    }
    if (!quorumRate) return;
    const checkQuorumMet =
      +vote.result_count / +authUser.totalMembers >= +quorumRate / 100;

    return (
      <div className="font-size-14">
        <label>{vote.result_count}</label> /{" "}
        <label className="pr-2">{authUser.totalMembers}</label>
        {checkQuorumMet ? <Icon.Check size="14" /> : <Icon.X size="14" />}
      </div>
    );
  }

  renderHeader() {
    const { authUser } = this.props;
    let html = null;

    if (authUser && authUser.is_member) {
      // Voting Associate
      html = (
        <Fragment>
          <div
            className="c-col-0 c-cols"
            onClick={() => this.clickHeader("proposal.id")}
          >
            <label className="font-size-14">#</label>
            {this.renderTriangle("proposal.id")}
          </div>
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("vote.content_type")}
          >
            <label className="font-size-14">Ballot Type</label>
            {this.renderTriangle("vote.content_type")}
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Euros</label>
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("vote_result_type")}
          >
            <label className="font-size-14">My Vote</label>
            {this.renderTriangle("vote_result_type")}
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Rep</label>
          </div>
          <div
            className="c-col-6 c-cols"
            onClick={() => this.clickHeader("timeLeft")}
          >
            <label className="font-size-14">Time Left</label>
            {this.renderTriangle("timeLeft")}
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">Attestation Rate</label>
          </div>
          <div className="c-col-8 c-cols">
            <label className="font-size-14">Quorum</label>
          </div>
          <div
            className="c-col-9 c-cols"
            onClick={() => this.clickHeader("vote.created_at")}
          >
            <label className="font-size-14">Submitted</label>
            {this.renderTriangle("vote.created_at")}
          </div>
        </Fragment>
      );
    } else {
      // Associate, Guest or Admin
      html = (
        <Fragment>
          <div
            className="c-col-0 c-cols"
            onClick={() => this.clickHeader("proposal.id")}
          >
            <label className="font-size-14">#</label>
            {this.renderTriangle("proposal.id")}
          </div>
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("vote.content_type")}
          >
            <label className="font-size-14">Ballot Type</label>
            {this.renderTriangle("vote.content_type")}
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Euros</label>
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("timeLeft")}
          >
            <label className="font-size-14">Time Left</label>
            {this.renderTriangle("timeLeft")}
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Attestation Rate</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Quorum</label>
          </div>
          <div
            className="c-col-7 c-cols"
            onClick={() => this.clickHeader("vote.created_at")}
          >
            <label className="font-size-14">Submitted</label>
            {this.renderTriangle("vote.created_at")}
          </div>
        </Fragment>
      );
    }

    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">{html}</div>
      </div>
    );
  }

  renderMyVote(vote) {
    const { authUser } = this.props;
    // OP
    if (authUser.id == vote.user_id)
      return <a className="btn btn-orange extra-small">Not Eligible</a>;

    if (!vote.vote_result_type)
      return <a className="btn btn-primary extra-small">None</a>;
    else if (vote.vote_result_type == "for")
      return <a className="btn btn-success extra-small">For</a>;
    return <a className="btn btn-danger extra-small">Against</a>;
  }

  renderRep(vote) {
    const { authUser } = this.props;
    // OP
    if (authUser.id == vote.user_id)
      return <label className="font-size-14 d-block">-</label>;
    return (
      <label className="font-size-14 d-block">
        {vote.vote_result_value || 0}
      </label>
    );
  }

  renderTooltip() {
    return (
      <Fragment>
        <p className="font-size-13">{`This area displays informal votes currently in progress. If you are a Voting Associate, you should review and vote.`}</p>
      </Fragment>
    );
  }

  renderVotes() {
    const { votes } = this.state;
    const { authUser, settings } = this.props;
    const items = [];

    if (!votes || !votes.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    votes.forEach((vote, index) => {
      let minsAdd = 0;
      if (vote.content_type == "grant") {
        if (settings.time_unit_informal && settings.time_informal) {
          if (settings.time_unit_informal == "min")
            minsAdd = parseInt(settings.time_informal);
          else if (settings.time_unit_informal == "hour")
            minsAdd = parseInt(settings.time_informal) * 60;
          else if (settings.time_unit_informal == "day")
            minsAdd = parseInt(settings.time_informal) * 24 * 60;
        }
      } else if (
        ["simple", "admin-grant", "advance-payment"].includes(vote.content_type)
      ) {
        if (settings.time_unit_simple && settings.time_simple) {
          if (settings.time_unit_simple == "min")
            minsAdd = parseInt(settings.time_simple);
          else if (settings.time_unit_simple == "hour")
            minsAdd = parseInt(settings.time_simple) * 60;
          else if (settings.time_unit_simple == "day")
            minsAdd = parseInt(settings.time_simple) * 24 * 60;
        }
      } else if (vote.content_type == "milestone") {
        if (settings.time_unit_milestone && settings.time_milestone) {
          if (settings.time_unit_milestone == "min")
            minsAdd = parseInt(settings.time_milestone);
          else if (settings.time_unit_milestone == "hour")
            minsAdd = parseInt(settings.time_milestone) * 60;
          else if (settings.time_unit_milestone == "day")
            minsAdd = parseInt(settings.time_milestone) * 24 * 60;
        }
      }

      /* Calculate Duration */
      let min = 0;
      let hours = 0;
      let day = 0;

      let diff = moment(vote.created_at)
        .add(minsAdd, "minutes")
        .diff(moment(), "minutes");
      if (diff > 0) {
        min = diff % 60;
        hours = parseInt(diff / 60);
        day = parseInt(hours / 24);
        hours = hours % 24;
      }
      /* Calculate Duration End */

      if (authUser && authUser.is_member) {
        // Voting Associate
        items.push(
          <li key={`vote_${index}`} onClick={() => this.clickRow(vote)}>
            <div className="infinite-row">
              <div className="c-col-0 c-cols">
                <label className="font-size-14 d-block">
                  {vote.proposalId}
                </label>
              </div>
              <div className="c-col-1 c-cols">
                <Tooltip title={vote.title} placement="bottom">
                  <label className="font-size-14 d-block">{vote.title}</label>
                </Tooltip>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14 d-block text-capitalize">
                  {BALLOT_TYPES[vote.content_type]}
                </label>
              </div>
              <div className="c-col-3 c-cols">
                {Helper.formatPrice(vote.euros || 0)}
              </div>
              <div className="c-col-4 c-cols">{this.renderMyVote(vote)}</div>
              <div className="c-col-5 c-cols">{this.renderRep(vote)}</div>
              <div className="c-col-6 c-cols">
                <div className="vote-clock-wrap">
                  <Icon.Clock size={14} color="#ffffff" />
                  <p className="font-size-12">{`${day}D:${hours}H:${min}MIN`}</p>
                </div>
              </div>
              <div className="c-col-7 c-cols">
                <label className="font-size-14 d-block">
                  {vote.rate?.toFixed(2)}%
                </label>
              </div>
              <div className="c-col-8 c-cols">
                <label className="font-size-14 d-block">
                  {this.renderQuorum(vote)}
                </label>
              </div>
              <div className="c-col-9 c-cols">
                <label className="font-size-14 d-block">
                  {moment(vote.created_at).local().format("M/D/YYYY")}{" "}
                  {moment(vote.created_at).local().format("h:mm A")}
                </label>
              </div>
            </div>
          </li>
        );
      } else {
        // Associate, Guest or Admin
        items.push(
          <li key={`vote_${index}`} onClick={() => this.clickRow(vote)}>
            <div className="infinite-row">
              <div className="c-col-0 c-cols">
                <label className="font-size-14 d-block">
                  {vote.proposalId}
                </label>
              </div>
              <div className="c-col-1 c-cols">
                <Tooltip title={vote.title} placement="bottom">
                  <label className="font-size-14 d-block">{vote.title}</label>
                </Tooltip>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14 d-block text-capitalize">
                  {BALLOT_TYPES[vote.content_type]}
                </label>
              </div>
              <div className="c-col-3 c-cols">
                {Helper.formatPrice(vote.euros || 0)}
              </div>
              <div className="c-col-4 c-cols">
                <div className="vote-clock-wrap">
                  <Icon.Clock size={14} color="#ffffff" />
                  <p className="font-size-12">{`${day}D:${hours}H:${min}MIN`}</p>
                </div>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14 d-block">
                  {vote.rate?.toFixed(2)}%
                </label>
              </div>
              <div className="c-col-6 c-cols">
                <label className="font-size-14 d-block">
                  {this.renderQuorum(vote)}
                </label>
              </div>
              <div className="c-col-7 c-cols">
                <label className="font-size-14 d-block">
                  {moment(vote.created_at).local().format("M/D/YYYY")}{" "}
                  {moment(vote.created_at).local().format("h:mm A")}
                </label>
              </div>
            </div>
          </li>
        );
      }
    });

    return <ul>{items}</ul>;
  }

  getUnvoted(val) {
    const { authUser } = this.props;
    this.setState({ show_unvoted: Number(val) }, () => {
      this.props.dispatch(saveUnvotedInformal({ check: Number(val) }));
      authUser.show_unvoted_informal = Number(val);
      this.props.dispatch(saveUser({ ...authUser }));
      this.reloadTable();
    });
  }

  render() {
    const { authUser } = this.props;
    const { loading, search, show_unvoted, totalUnvoted } = this.state;
    let className = authUser && authUser.is_member ? "member" : "";
    className += " app-infinite-box";

    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-active-informal-votes-section" className={className}>
          <div className="app-infinite-search-wrap">
            {authUser.is_admin ? (
              <label>Active Informal Votes</label>
            ) : (
              <div className="app-tooltip-wrap">
                <label>Active Informal Votes</label>
                <Tooltip title={this.renderTooltip()} placement="right-end">
                  <Icon.Info size={16} />
                </Tooltip>
                <UnvotedFilter
                  votes={totalUnvoted}
                  show_unvoted={show_unvoted}
                  onChange={(val) => this.getUnvoted(val)}
                />
              </div>
            )}

            <input
              type="text"
              value={search}
              onChange={this.handleSearch}
              placeholder="Search..."
            />
          </div>

          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}
              <div
                className="infinite-body"
                id="app-active-informal-votes-sectionBody"
              >
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderVotes()
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ActiveInformalVotes));
