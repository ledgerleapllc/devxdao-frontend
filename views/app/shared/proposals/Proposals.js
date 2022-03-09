import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import { getActiveDiscussions } from "../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import Helper from "../../../../utils/Helper";
import { TimeClock } from "../../shared/time-clock/TimeClock";

import "./proposals.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Proposals extends Component {
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
    this.startTracking();
    this.getProposals();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-proposals-sectionBody");
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
      getActiveDiscussions(
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

    if (authUser && authUser.is_admin) history.push(`/app/proposal/${item.id}`);
    else {
      if (item.status != "approved") return;

      if (authUser.is_member) history.push(`/app/proposal/${item.id}`);
      else {
        if (!item.votes || !item.votes.length)
          history.push(`/app/proposal/${item.id}`);
      }
    }
  }

  renderTitle(item) {
    return item.title;
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

    proposals.forEach((item, index) => {
      items.push(
        <li key={`proposal_${index}`} onClick={() => this.clickRow(item)}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols">
              <label className="font-size-14">{item.id}</label>
            </div>
            <div className="c-col-1 c-cols">
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
              <p className="font-size-12">
                {Helper.getExcerpt(item.short_description)}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <div className="proposal-image-wrap">
                <div>
                  <Icon.MessageCircle size={20} />
                </div>
                <span className="font-size-12">{item.comments}</span>
              </div>
            </div>
            <div className="c-col-3 c-cols">
              <div className="proposal-image-wrap">
                <div>
                  <Icon.Monitor size={20} />
                </div>
                <span className="font-size-12">{item.changes}</span>
              </div>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-5 c-cols">
              <TimeClock lastTime={moment(item.created_at)} isCountUp />
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
    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-proposals-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>
              Active Discussions&nbsp;&nbsp;
              <Icon.Info size={16} />
            </label>

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
                    onClick={() => this.clickHeader("id")}
                  >
                    <label className="font-size-14">#</label>
                    {this.renderTriangle("id")}
                  </div>
                  <div
                    className="c-col-1 c-cols"
                    onClick={() => this.clickHeader("title")}
                  >
                    <label className="font-size-14">Title</label>
                    {this.renderTriangle("title")}
                  </div>
                  <div
                    className="c-col-2 c-cols"
                    onClick={() => this.clickHeader("topic_posts_count")}
                  >
                    <label className="font-size-14">Comments</label>
                    {this.renderTriangle("topic_posts_count")}
                  </div>
                  <div
                    className="c-col-3 c-cols"
                    onClick={() => this.clickHeader("changes")}
                  >
                    <label className="font-size-14">Changes</label>
                    {this.renderTriangle("changes")}
                  </div>
                  <div
                    className="c-col-4 c-cols"
                    onClick={() => this.clickHeader("created_at")}
                  >
                    <label className="font-size-14">Date</label>
                    {this.renderTriangle("created_at")}
                  </div>
                  <div className="c-col-5 c-cols">
                    <label className="font-size-14">Time Active</label>
                  </div>
                </div>
              </div>
              <div className="infinite-body" id="app-proposals-sectionBody">
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

export default connect(mapStateToProps)(withRouter(Proposals));
