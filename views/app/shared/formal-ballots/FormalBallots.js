import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { getActiveFormalVotes } from "../../../../utils/Thunk";
import { BALLOT_TYPES } from "../../../../utils/enum";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  setActiveModal,
  setCustomModalData,
  setFormalBallotTableStatus,
} from "../../../../redux/actions";

import "./formal-ballots.scss";
import { TimeClock } from "../../shared/time-clock/TimeClock";
// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    formalBallotTableStatus: state.admin.formalBallotTableStatus,
    settings: state.global.settings,
  };
};

class FormalBallots extends Component {
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

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { formalBallotTableStatus } = this.props;
    if (!prevProps.formalBallotTableStatus && formalBallotTableStatus) {
      this.reloadTable();
      this.props.dispatch(setFormalBallotTableStatus(false));
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-formal-ballots-sectionBody");
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
      getActiveFormalVotes(
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
      authUser.id == vote.user_id
    ) {
      if (authUser.is_admin || authUser.id == vote.user_id)
        history.push(`/app/proposal/${vote.proposal_id}`);
      else if (authUser.is_member) {
        // const users = vote.informal_result_users || [];
        // if (!users.length || users.includes(authUser.id))
        history.push(`/app/proposal/${vote.proposal_id}`);
        // else {
        //   this.props.dispatch(
        //     setCustomModalData({
        //       "voting-access-alert-2": {
        //         render: true,
        //         title: "You cannot access this vote",
        //       },
        //     })
        //   );
        //   this.props.dispatch(setActiveModal("custom-global-modal"));
        // }
      }
    } else if (authUser.is_participant || authUser.is_guest) {
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

  renderTitle(vote) {
    return vote.title;
  }

  renderTimeRemaining(vote) {
    let mins = 0;
    const { settings } = this.props;
    if (vote.content_type == "grant") {
      if (settings.time_unit_formal == "min")
        mins = parseInt(settings.time_formal);
      else if (settings.time_unit_formal == "hour")
        mins = parseInt(settings.time_formal) * 60;
      else if (settings.time_unit_formal == "day")
        mins = parseInt(settings.time_formal) * 24 * 60;
    } else if (
      ["simple", "admin-grant", "advance-payment"].includes(vote.content_type)
    ) {
      if (settings.time_unit_simple == "min")
        mins = parseInt(settings.time_simple);
      else if (settings.time_unit_simple == "hour")
        mins = parseInt(settings.time_simple) * 60;
      else if (settings.time_unit_simple == "day")
        mins = parseInt(settings.time_simple) * 24 * 60;
    } else if (vote.content_type == "milestone") {
      if (settings.time_unit_milestone == "min")
        mins = parseInt(settings.time_milestone);
      else if (settings.time_unit_milestone == "hour")
        mins = parseInt(settings.time_milestone) * 60;
      else if (settings.time_unit_milestone == "day")
        mins = parseInt(settings.time_milestone) * 24 * 60;
    }
    const lastTime = moment(vote.created_at).add(mins, "minutes");
    return <TimeClock lastTime={lastTime} />;
  }

  renderVotes() {
    const { votes } = this.state;
    const items = [];

    if (!votes || !votes.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-12">No Results Found</label>
        </div>
      );
    }

    votes.forEach((vote, index) => {
      items.push(
        <li key={`vote_${index}`} onClick={() => this.clickRow(vote)}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols">
              <label className="font-size-12 d-block">{vote.proposalId}</label>
            </div>
            <div className="c-col-1 c-cols">
              <label className="font-size-12 d-block">
                {this.renderTitle(vote)}
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-12 d-block">
                {BALLOT_TYPES[vote.content_type]}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-12 d-block">
                {moment(vote.created_at).fromNow()}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-12 d-block">
                {this.renderTimeRemaining(vote)}
              </label>
            </div>
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
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

  render() {
    const { loading, search } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <Fade distance={"20px"} right duration={500} delay={500}>
        <section id="app-formal-ballots-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>Active Formal Ballots</label>
            <input
              type="text"
              value={search}
              onChange={this.handleSearch}
              placeholder="Search..."
            />
          </div>

          <div className="infinite-content">
            <div className="infinite-contentInner">
              <div className="infinite-header">
                <div className="infinite-headerInner">
                  <div
                    className="c-col-0 c-cols"
                    onClick={() => this.clickHeader("proposal.id")}
                  >
                    <label className="font-size-12">#</label>
                    {this.renderTriangle("proposal.id")}
                  </div>
                  <div
                    className="c-col-1 c-cols"
                    onClick={() => this.clickHeader("proposal.title")}
                  >
                    <label className="font-size-12">Title</label>
                    {this.renderTriangle("proposal.title")}
                  </div>
                  <div
                    className="c-col-2 c-cols"
                    onClick={() => this.clickHeader("vote.content_type")}
                  >
                    <label className="font-size-12">Ballot Type</label>
                    {this.renderTriangle("vote.content_type")}
                  </div>
                  <div
                    className="c-col-3 c-cols"
                    onClick={() => this.clickHeader("vote.created_at")}
                  >
                    <label className="font-size-12">Submitted</label>
                    {this.renderTriangle("vote.created_at")}
                  </div>
                  <div className="c-col-4 c-cols">
                    <label className="font-size-12">Time Remaining</label>
                  </div>
                </div>
              </div>
              <div
                className="infinite-body"
                id="app-formal-ballots-sectionBody"
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

export default connect(mapStateToProps)(withRouter(FormalBallots));
