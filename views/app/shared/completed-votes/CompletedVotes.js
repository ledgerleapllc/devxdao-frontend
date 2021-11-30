import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import * as Icon from "react-feather";
import Tooltip from "@material-ui/core/Tooltip";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import { getCompletedVotes } from "../../../../utils/Thunk";
import {
  setActiveModal,
  setCompletedVotesTableStatus,
  setCustomModalData,
} from "../../../../redux/actions";

import "./completed-votes.scss";
import Helper from "../../../../utils/Helper";
import { BALLOT_TYPES } from "../../../../utils/enum";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    completedVotesTableStatus: state.admin.completedVotesTableStatus,
  };
};

class CompletedVotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      votes: [],
      sort_key: "vote.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.startTracking();
    this.getVotes();
  }

  componentDidUpdate(prevProps) {
    const { completedVotesTableStatus } = this.props;
    if (!prevProps.completedVotesTableStatus && completedVotesTableStatus) {
      this.reloadTable();
      this.props.dispatch(setCompletedVotesTableStatus(false));
    }
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-completed-votes-sectionBody");
    this.$elem.addEventListener("scroll", this.trackScroll);
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
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    this.props.dispatch(
      getCompletedVotes(
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
          });
        }
      )
    );
  }

  clickRow(vote) {
    const { authUser, history } = this.props;

    if (
      authUser.is_member ||
      authUser.is_admin ||
      authUser.is_participant ||
      authUser.id == vote.user_id
    ) {
      let link = `/app/proposal/${vote.proposal_id}/informal-vote`;
      if (vote.content_type == "milestone")
        link = `/app/proposal/${vote.proposal_id}/milestone-vote/${vote.id}`;
      else if (vote.type == "formal")
        link = `/app/proposal/${vote.proposal_id}/formal-vote`;

      // history.push(`/app/proposal/${vote.proposal_id}`);
      history.push(link);
    } else {
      this.props.dispatch(
        setCustomModalData({
          "voting-access-alert": {
            render: true,
            title: "Sorry, only voting associates may access a live vote.",
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

  clickRevote(vote) {
    this.props.dispatch(
      setCustomModalData({
        revote: {
          render: true,
          title: "You are restarting this vote",
          data: vote,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
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
            onClick={() => this.clickHeader("vote.type")}
          >
            <label className="font-size-14">Type</label>
            {this.renderTriangle("vote.type")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("vote.content_type")}
          >
            <label className="font-size-14">Ballot Type</label>
            {this.renderTriangle("vote.content_type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Euros</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">My Vote</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Rep</label>
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">Result</label>
          </div>
          <div className="c-col-8 c-cols">
            <label className="font-size-14">Stake For/Against</label>
          </div>
          <div className="c-col-9 c-cols">
            <label className="font-size-14">Quorum</label>
          </div>
          <div
            className="c-col-10 c-cols"
            onClick={() => this.clickHeader("vote.updated_at")}
          >
            <label className="font-size-14">Completed Date</label>
            {this.renderTriangle("vote.updated_at")}
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
            onClick={() => this.clickHeader("vote.type")}
          >
            <label className="font-size-14">Type</label>
            {this.renderTriangle("vote.type")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("vote.content_type")}
          >
            <label className="font-size-14">Ballot Type</label>
            {this.renderTriangle("vote.content_type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Euros</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Result</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Stake For/Against</label>
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">Quorum</label>
          </div>
          <div
            className="c-col-8 c-cols"
            onClick={() => this.clickHeader("vote.updated_at")}
          >
            <label className="font-size-14">Completed Date</label>
            {this.renderTriangle("vote.updated_at")}
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
      return <label className="font-size-14 d-block">-</label>;

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

  renderResult(vote) {
    if (vote.result_count && vote.result == "success")
      return <label className="font-size-14 color-success d-block">Pass</label>;
    else if (vote.result == "no-quorum")
      return (
        <label className="font-size-14 color-danger d-block">No Quorum</label>
      );
    return <label className="font-size-14 color-danger d-block">Fail</label>;
  }

  renderStake(vote) {
    if (vote.result_count && vote.result == "success") {
      return (
        <div>
          <label className="font-size-14 color-success">{vote.for_value}</label>
          &nbsp;{"/"}&nbsp;
          <label className="font-size-14">{vote.against_value}</label>
        </div>
      );
    }

    return (
      <div>
        <label className="font-size-14">{vote.for_value}</label>
        &nbsp;{"/"}&nbsp;
        <label className="font-size-14 color-danger">
          {vote.against_value}
        </label>
      </div>
    );
  }

  renderQuorum(vote) {
    const { authUser } = this.props;

    if (vote.result == "no-quorum") {
      let showButton = false;
      if (authUser.is_admin || authUser.id == vote.user_id) showButton = true;

      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="font-size-14 color-danger text-nowrap">
            <label>{vote.result_count}</label> /{" "}
            <label>{authUser.totalMembers}</label>
          </div>
          {showButton ? (
            <a
              style={{ marginLeft: "10px" }}
              className="btn btn-primary extra-small btn-fluid-small"
              onClick={() => this.clickRevote(vote)}
            >
              Revote
            </a>
          ) : null}
        </div>
      );
    }
    return (
      <div className="font-size-14 color-success">
        <label>{vote.result_count}</label> /{" "}
        <label>{authUser.totalMembers}</label>
      </div>
    );
  }

  renderTooltip() {
    return (
      <Fragment>
        <p className="font-size-13">{`This area displays the votes that have already completed in the system.`}</p>
      </Fragment>
    );
  }

  renderVotes() {
    const { votes } = this.state;
    const { authUser } = this.props;
    const items = [];

    if (!votes || !votes.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    votes.forEach((vote, index) => {
      if (authUser && authUser.is_member) {
        // Voting Associate
        items.push(
          <li key={`vote_${index}`}>
            <div className="infinite-row">
              <div
                className="c-col-0 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {vote.proposalId}
                </label>
              </div>
              <div
                className="c-col-1 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <Tooltip title={vote.title} placement="bottom">
                  <label className="font-size-14 d-block">{vote.title}</label>
                </Tooltip>
              </div>
              <div
                className="c-col-2 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {vote.type == "informal" ? "Informal" : "Formal"}
                </label>
              </div>
              <div
                className="c-col-3 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block text-capitalize">
                  {BALLOT_TYPES[vote.content_type]}
                </label>
              </div>
              <div
                className="c-col-4 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {Helper.formatPriceNumber(vote.euros || "", "€")}
              </div>
              <div
                className="c-col-5 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderMyVote(vote)}
              </div>
              <div
                className="c-col-6 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderRep(vote)}
              </div>
              <div
                className="c-col-7 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderResult(vote)}
              </div>
              <div
                className="c-col-8 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderStake(vote)}
              </div>
              <div className="c-col-9 c-cols">{this.renderQuorum(vote)}</div>
              <div
                className="c-col-10 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {moment(vote.updated_at).local().format("M/D/YYYY")}{" "}
                  {moment(vote.updated_at).local().format("h:mm A")}
                </label>
              </div>
            </div>
          </li>
        );
      } else {
        // Associate, Guest or Admin
        items.push(
          <li key={`vote_${index}`}>
            <div className="infinite-row">
              <div
                className="c-col-0 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {vote.proposalId}
                </label>
              </div>
              <div
                className="c-col-1 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <Tooltip title={vote.title} placement="bottom">
                  <label className="font-size-14 d-block">{vote.title}</label>
                </Tooltip>
              </div>
              <div
                className="c-col-2 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {vote.type == "informal" ? "Informal" : "Formal"}
                </label>
              </div>
              <div
                className="c-col-3 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block text-capitalize">
                  {BALLOT_TYPES[vote.content_type]}
                </label>
              </div>
              <div
                className="c-col-4 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {Helper.formatPriceNumber(vote.euros || "", "€")}
              </div>
              <div
                className="c-col-5 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderResult(vote)}
              </div>
              <div
                className="c-col-6 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                {this.renderStake(vote)}
              </div>
              <div className="c-col-7 c-cols">{this.renderQuorum(vote)}</div>
              <div
                className="c-col-8 c-cols"
                onClick={() => this.clickRow(vote)}
              >
                <label className="font-size-14 d-block">
                  {moment(vote.updated_at).local().format("M/D/YYYY")}{" "}
                  {moment(vote.updated_at).local().format("h:mm A")}
                </label>
              </div>
            </div>
          </li>
        );
      }
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { authUser } = this.props;
    const { loading, search } = this.state;
    let className = authUser && authUser.is_member ? "member" : "";
    className += " app-infinite-box";

    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-completed-votes-section" className={className}>
          <div className="app-infinite-search-wrap">
            {authUser.is_admin ? (
              <label>Completed Votes</label>
            ) : (
              <div className="app-tooltip-wrap">
                <label>Completed Votes</label>
                <Tooltip title={this.renderTooltip()} placement="right-end">
                  <Icon.Info size={16} />
                </Tooltip>
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
                id="app-completed-votes-sectionBody"
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

export default connect(mapStateToProps)(withRouter(CompletedVotes));
