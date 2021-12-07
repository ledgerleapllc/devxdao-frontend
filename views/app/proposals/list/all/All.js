import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import { getAllProposalsShared } from "../../../../../utils/Thunk";
import Helper from "../../../../../utils/Helper";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import Tooltip from "@material-ui/core/Tooltip";

import "./all.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class AllProposals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      proposals: [],
      sort_key: "proposal.id",
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
    const { authUser } = this.props;
    if (authUser && authUser.id) this.startTracking();

    this.getProposals();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;

    // Start Tracking
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.startTracking();
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-all-proposals-sectionBody");
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
    this.setState({ page_id: 1, proposals: [], finished: false }, () => {
      this.getProposals();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getProposals(false);
    });
  }

  getProposals(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      proposals,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 20,
    };

    this.props.dispatch(
      getAllProposalsShared(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            proposals: [...proposals, ...result],
          });
        }
      )
    );
  }

  clickRow(item) {
    const { history, authUser } = this.props;
    if (authUser.is_admin || authUser.is_member)
      history.push(`/app/proposal/${item.id}`);
    else if (authUser.is_participant) {
      if (item.user_id == authUser.id) {
        // OP
        history.push(`/app/proposal/${item.id}`);
      } else {
        // Not OP & Not Vote
        if (!item.votes || !item.votes.length)
          history.push(`/app/proposal/${item.id}`);
      }
    }
  }

  renderTitle(item) {
    return item.title;
  }

  // Render Status Label
  renderStatusLabel(text, type) {
    return <label className={`font-size-14 color-${type}`}>{text}</label>;
  }

  // Render Status
  renderStatus(item) {
    const { dos_paid } = item;
    if (item.status == "payment") {
      if (dos_paid) {
        // Paid
        return this.renderStatusLabel("Payment Clearing", "info");
      } else {
        // Not Paid
        return this.renderStatusLabel("Payment Waiting", "info");
      }
    } else if (item.status == "pending")
      return this.renderStatusLabel("Pending", "primary");
    else if (item.status == "denied") {
      return this.renderStatusLabel("Denied", "danger");
    } else if (item.status == "completed")
      return this.renderStatusLabel("Completed", "");
    else if (item.status == "approved") {
      if (item.votes && item.votes.length) {
        if (item.votes.length > 1) {
          // Formal Vote
          const formalVote = item.votes[1];
          if (formalVote.status == "active") {
            return this.renderStatusLabel(
              <Fragment>
                Formal Voting
                <br />
                Live
              </Fragment>,
              "success"
            );
          } else {
            // Formal Vote Result
            if (formalVote.result == "success") {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  Passed
                </Fragment>,
                "success"
              );
            } else if (formalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  No Quorum
                </Fragment>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  Failed
                </Fragment>,
                "danger"
              );
            }
          }
        } else {
          // Informal Vote
          const informalVote = item.votes[0];
          if (informalVote.status == "active")
            return this.renderStatusLabel(
              <Fragment>
                Informal Voting
                <br />
                Live
              </Fragment>,
              "success"
            );
          else {
            // Informal Vote Result
            if (informalVote.result == "success") {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  Passed
                </Fragment>,
                "success"
              );
            } else if (informalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  No Quorum
                </Fragment>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  Failed
                </Fragment>,
                "danger"
              );
            }
          }
        }
      } else return this.renderStatusLabel("In Discussion", "success");
    }
    return null;
  }

  renderProposals() {
    const { proposals } = this.state;
    const items = [];

    if (!proposals || !proposals.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    proposals.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row" onClick={() => this.clickRow(item)}>
            <div className="c-col-0 c-cols">
              <label className="font-size-14 d-block">{item.id}</label>
            </div>
            <div className="c-col-1 c-cols">
              <Tooltip title={item.title} placement="bottom">
                <label className="font-size-14 font-weight-700">
                  {item.title}
                </label>
              </Tooltip>
              <p className="font-size-12">
                {Helper.getExcerpt(
                  item.short_description || item.member_reason
                )}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14 d-block">{item.forum_name}</label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">
                {item.type == "grant" ? "Grant" : "Simple"}
              </label>
            </div>
            <div className="c-col-4 c-cols">{this.renderStatus(item)}</div>
            <div className="c-col-5 c-cols">
              <div className="c-image-wrap">
                <div>
                  <Icon.MessageCircle size={20} />
                </div>
                <span className="font-size-12">{item.comments}</span>
              </div>
            </div>
            <div className="c-col-6 c-cols">
              <div className="c-image-wrap">
                <div>
                  <Icon.Monitor size={20} />
                </div>
                <span className="font-size-12">{item.changes}</span>
              </div>
            </div>
            <div className="c-col-7 c-cols">
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
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
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Forum Name</label>
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("proposal.type")}
          >
            <label className="font-size-14">Type</label>
            {this.renderTriangle("proposal.type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Status</label>
          </div>
          <div
            className="c-col-5 c-cols"
            onClick={() => this.clickHeader("proposal.comments")}
          >
            <label className="font-size-14">Comments</label>
            {this.renderTriangle("proposal.comments")}
          </div>
          <div
            className="c-col-6 c-cols"
            onClick={() => this.clickHeader("proposal.changes")}
          >
            <label className="font-size-14">Changes</label>
            {this.renderTriangle("proposal.changes")}
          </div>
          <div
            className="c-col-7 c-cols"
            onClick={() => this.clickHeader("proposal.created_at")}
          >
            <label className="font-size-14">Date</label>
            {this.renderTriangle("proposal.created_at")}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loading, search } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    return (
      <Fade distance={"20px"} bottom duration={300} delay={600}>
        <section id="app-all-proposals-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>All Proposals</label>

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

              <div className="infinite-body" id="app-all-proposals-sectionBody">
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderProposals()
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AllProposals));
