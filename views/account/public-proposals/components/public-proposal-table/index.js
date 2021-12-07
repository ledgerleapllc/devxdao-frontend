import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import Helper from "../../../../../utils/Helper";
import { getAllPublicProposalsShared } from "../../../../../utils/Thunk";
import "./public-proposal-table.scss";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { PROPOSAL_TYPES } from "../../../../../utils/enum";

const mapStateToProps = () => {
  return {};
};

class PublicProposalTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeLoad: true,
      loading: false,
      data: [],
      sort_key: "proposal.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      params: {},
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;
    if (prevProps.params !== params) {
      this.setState({ params: { ...params } });
      setTimeout(() => this.reloadTable());
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("public-proposals-scroll-track");
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

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getData(false);
    });
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  getData(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      data,
      firstTimeLoad,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 15,
      ...this.state.params,
    };

    this.props.dispatch(
      getAllPublicProposalsShared(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          const finished = res.finished || false;
          this.setState({
            firstTimeLoad: false,
            loading: false,
            calling: false,
            finished,
            data: [...data, ...result],
          });
          if (firstTimeLoad) {
            setTimeout(() => this.startTracking());
          }
        }
      )
    );
  }

  renderVoteResult(item) {
    const vote = item.votes[item.votes.length - 1];
    if (vote && vote.status === "completed") {
      if (vote.result_count && vote.result == "success")
        return (
          <label className="font-size-14 color-success d-block">Pass</label>
        );
      else if (vote.result == "no-quorum")
        return (
          <label className="font-size-14 color-danger d-block">No Quorum</label>
        );
      return <label className="font-size-14 color-danger d-block">Fail</label>;
    }
    return null;
  }

  renderMilestoneIndex(item) {
    const idx = item.milestones.findIndex((x) => x.id === item.id);
    return idx + 1;
  }

  gotoDetail = (item) => {
    const { history } = this.props;
    history.push(`/app/milestones/${item.id}/logs`);
  };

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
              <>
                Formal Voting
                <br />
                Live
              </>,
              "success"
            );
          } else {
            // Formal Vote Result
            if (formalVote.result == "success") {
              return this.renderStatusLabel(
                <>
                  Formal Voting
                  <br />
                  Passed
                </>,
                "success"
              );
            } else if (formalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <>
                  Formal Voting
                  <br />
                  No Quorum
                </>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <>
                  Formal Voting
                  <br />
                  Failed
                </>,
                "danger"
              );
            }
          }
        } else {
          // Informal Vote
          const informalVote = item.votes[0];
          if (informalVote.status == "active")
            return this.renderStatusLabel(
              <>
                Informal Voting
                <br />
                Live
              </>,
              "success"
            );
          else {
            // Informal Vote Result
            if (informalVote.result == "success") {
              return this.renderStatusLabel(
                <>
                  Informal Voting
                  <br />
                  Passed
                </>,
                "success"
              );
            } else if (informalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <>
                  Informal Voting
                  <br />
                  No Quorum
                </>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <>
                  Informal Voting
                  <br />
                  Failed
                </>,
                "danger"
              );
            }
          }
        }
      } else return this.renderStatusLabel("In Discussion", "success");
    }
    return null;
  }

  clickRow(item) {
    const { history } = this.props;
    history.push(`/public-proposals/${item.id}`);
  }

  renderResult() {
    const { data } = this.state;
    const items = [];

    if (!data || !data.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    data.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row" onClick={() => this.clickRow(item)}>
            <div className="c-col-0 c-cols">
              <label className="font-size-14 d-block">{item.id}</label>
            </div>
            <div className="c-col-1 c-cols">
              <label className="font-size-14 font-weight-700">
                {item.title}
              </label>
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
              <label className="font-size-14 d-block">{item.telegram}</label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14 text-capitalize">
                {PROPOSAL_TYPES[item.type]}
              </label>
            </div>
            <div className="c-col-5 c-cols">{this.renderStatus(item)}</div>
            <div className="c-col-6 c-cols">
              <div className="c-image-wrap">
                <div>
                  <Icon.MessageCircle size={20} />
                </div>
                <span className="font-size-12">{item.comments}</span>
              </div>
            </div>
            <div className="c-col-7 c-cols">
              <div className="c-image-wrap">
                <div>
                  <Icon.Monitor size={20} />
                </div>
                <span className="font-size-12">{item.changes}</span>
              </div>
            </div>
            <div className="c-col-8 c-cols">
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

  render() {
    const { loading, search } = this.state;
    return (
      <div className="public-proposals-table">
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
                <div className="c-col-3 c-cols">
                  <label className="font-size-14">Telegram</label>
                </div>
                <div
                  className="c-col-4 c-cols"
                  onClick={() => this.clickHeader("proposal.type")}
                >
                  <label className="font-size-14">Type</label>
                  {this.renderTriangle("proposal.type")}
                </div>
                <div className="c-col-5 c-cols">
                  <label className="font-size-14">Status</label>
                </div>
                <div
                  className="c-col-6 c-cols"
                  onClick={() => this.clickHeader("proposal.comments")}
                >
                  <label className="font-size-14">Comments</label>
                  {this.renderTriangle("proposal.comments")}
                </div>
                <div
                  className="c-col-7 c-cols"
                  onClick={() => this.clickHeader("proposal.changes")}
                >
                  <label className="font-size-14">Changes</label>
                  {this.renderTriangle("proposal.changes")}
                </div>
                <div
                  className="c-col-8 c-cols"
                  onClick={() => this.clickHeader("proposal.created_at")}
                >
                  <label className="font-size-14">Date</label>
                  {this.renderTriangle("proposal.created_at")}
                </div>
              </div>
            </div>
            <div className="infinite-body" id="public-proposals-scroll-track">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderResult()
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PublicProposalTable));
