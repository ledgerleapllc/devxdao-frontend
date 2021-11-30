import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import {
  setMoveToFormalTableStatus,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";
import {
  getMoveToFormalVotes,
  startFormalMilestoneVoting,
  startFormalVoting,
} from "../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import { BALLOT_TYPES } from "../../../../utils/enum";

import "./move-to-formal.scss";
import { Tooltip } from "@material-ui/core";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    moveToFormalTableStatus: state.table.moveToFormalTableStatus,
  };
};

class MoveToFormal extends Component {
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
    const { moveToFormalTableStatus } = this.props;
    if (!prevProps.moveToFormalTableStatus && moveToFormalTableStatus) {
      this.reloadTable();
      this.props.dispatch(setMoveToFormalTableStatus(false));
    }
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-move-to-formal-sectionBody");
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
      getMoveToFormalVotes(
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
    if (authUser.is_member || authUser.is_admin)
      history.push(`/app/proposal/${vote.proposal_id}`);
  }

  clickStartFormal(vote) {
    if (!confirm("Are you sure you are going to start the formal voting?"))
      return;

    if (vote.content_type == "milestone") {
      this.props.dispatch(
        startFormalMilestoneVoting(
          vote.proposal_id,
          vote.id,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                showAlert(
                  "Formal voting process has been started successfully",
                  "success"
                )
              );
              this.reloadTable();
            }
          }
        )
      );
    } else {
      this.props.dispatch(
        startFormalVoting(
          vote.proposal_id,
          false,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                showAlert(
                  "Formal voting process has been started successfully",
                  "success"
                )
              );
              this.reloadTable();
            }
          }
        )
      );
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

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
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
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("vote.updated_at")}
          >
            <label className="font-size-14">Completed Date</label>
            {this.renderTriangle("vote.updated_at")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  renderVotes() {
    const { votes } = this.state;
    const items = [];

    if (!votes || !votes.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    votes.forEach((vote, index) => {
      // Admin
      items.push(
        <li key={`vote_${index}`}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols" onClick={() => this.clickRow(vote)}>
              <label className="font-size-14 d-block">{vote.proposalId}</label>
            </div>
            <div className="c-col-1 c-cols" onClick={() => this.clickRow(vote)}>
              <Tooltip title={vote.title} placement="bottom">
                <label className="font-size-14">{vote.title}</label>
              </Tooltip>
            </div>
            <div className="c-col-2 c-cols" onClick={() => this.clickRow(vote)}>
              <label className="font-size-14 d-block text-capitalize">
                {BALLOT_TYPES[vote.content_type]}
              </label>
            </div>
            <div className="c-col-3 c-cols" onClick={() => this.clickRow(vote)}>
              <label className="font-size-14 d-block">
                {moment(vote.updated_at).local().format("M/D/YYYY")}{" "}
                {moment(vote.updated_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <a
                className="btn btn-primary extra-small btn-fluid-small"
                onClick={() => this.clickStartFormal(vote)}
              >
                Start Formal Voting
              </a>
            </div>
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { loading, search } = this.state;

    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-move-to-formal-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>{`Simple and Milestone Submissions That Passed Informal Vote`}</label>
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
                id="app-move-to-formal-sectionBody"
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

export default connect(mapStateToProps)(withRouter(MoveToFormal));
