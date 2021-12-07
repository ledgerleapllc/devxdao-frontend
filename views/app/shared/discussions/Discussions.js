import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import Tooltip from "@material-ui/core/Tooltip";
import {
  getActiveDiscussions,
  getCompletedDiscussions,
} from "../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import Helper from "../../../../utils/Helper";

import "./discussions.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Discussions extends Component {
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
    this.$body = document.getElementById("app-discussions-sectionBody");
    this.$section = document.getElementById("app-discussions-section");
    this.getProposals();
    this.startTracking();
  }

  componentDidUpdate(prevProps) {
    const { tab } = this.props;
    if (prevProps.tab != tab) this.reloadTable();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-discussions-sectionBody");
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
    const { tab } = this.props;
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

    if (tab == "active") {
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
    } else {
      this.props.dispatch(
        getCompletedDiscussions(
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
      /* Calculate Duration */
      let diff = moment().diff(moment(item.created_at));
      if (item.approved_at)
        diff = moment().diff(moment(item.approved_at + ".000Z"));

      const seconds = parseInt(diff / 1000);
      let mins = parseInt(seconds / 60);
      let hours = parseInt(mins / 60);
      mins -= 60 * hours;
      let days = parseInt(hours / 24);
      hours -= 24 * days;
      /* Calculate Duration End */

      items.push(
        <li key={`proposal_${index}`} onClick={() => this.clickRow(item)}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols">
              <label className="font-size-14">{item.id}</label>
            </div>
            <div className="c-col-1 c-cols">
              <Tooltip title={item.title} placement="bottom">
                <label className="font-size-14 font-weight-700">
                  {item.title}
                </label>
              </Tooltip>
              <p className="font-size-12">
                {Helper.getExcerpt(item.short_description)}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <div className="proposal-clock-wrap">
                <Icon.Clock size={20} />
                <p className="font-size-12">{`${days}D:${hours}H:${mins}MIN`}</p>
              </div>
            </div>
            <div className="c-col-3 c-cols">
              <div className="proposal-image-wrap">
                <div>
                  <Icon.MessageCircle size={20} />
                </div>
                <span className="font-size-12">{item.comments}</span>
              </div>
            </div>
            <div className="c-col-4 c-cols">
              <div className="proposal-image-wrap">
                <div>
                  <Icon.Monitor size={20} />
                </div>
                <span className="font-size-12">{item.changes}</span>
              </div>
            </div>
            <div className="c-col-5 c-cols">
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
            <label className="font-size-14">Forums</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("proposal.approved_at")}
          >
            <label className="font-size-14">Time Active</label>
            {this.renderTriangle("proposal.approved_at")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("proposal.comments")}
          >
            <label className="font-size-14">Comments</label>
            {this.renderTriangle("proposal.comments")}
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("proposal.changes")}
          >
            <label className="font-size-14">Changes</label>
            {this.renderTriangle("proposal.changes")}
          </div>
          <div
            className="c-col-5 c-cols"
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
    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-discussions-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>
              Proposals&nbsp;&nbsp;
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
              {this.renderHeader()}
              <div className="infinite-body" id="app-discussions-sectionBody">
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

export default connect(mapStateToProps)(withRouter(Discussions));
