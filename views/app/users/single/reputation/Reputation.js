import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { getReputationByUser } from "../../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../../components";

import "./reputation.scss";
import { DECIMALS } from "../../../../../utils/Constant";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Reputation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
      sort_key: "reputation.updated_at",
      sort_direction: "desc",
      calling: false,
      finished: false,
    };
  }

  componentDidMount() {
    this.getReputation();
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ items: [], finished: false }, () => {
      this.getReputation();
    });
  }

  getReputation(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      items,
    } = this.state;
    const { userId } = this.props;

    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      getReputationByUser(
        userId,
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.items || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            items: [...items, ...result],
          });
        }
      )
    );
  }

  renderTitle(item) {
    if (!item.proposal_id) return "-";
    return item.proposal_title;
  }

  // Render Value
  renderValue(item) {
    const value = parseFloat(item.value);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed(DECIMALS)}
        </label>
      );
    return "";
  }

  // Render Staked
  renderStaked(item) {
    const value = parseFloat(item.staked);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed(DECIMALS)}
        </label>
      );
    return "";
  }

  // Render Pending
  renderPending(item) {
    const value = parseFloat(item.pending);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed(DECIMALS)}
        </label>
      );
    return "";
  }

  renderItems() {
    const { items } = this.state;
    const renderItems = [];

    if (!items || !items.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    items.forEach((item) => {
      renderItems.push(
        <li key={`reputation_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">{item.event}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">{item.type}</label>
            </div>
            <div className="c-col-4 c-cols">{this.renderValue(item)}</div>
            <div className="c-col-5 c-cols">{this.renderStaked(item)}</div>
            <div className="c-col-6 c-cols">{this.renderPending(item)}</div>
            <div className="c-col-7 c-cols">
              <label className="font-size-14">
                {moment(item.updated_at).local().format("M/D/YYYY")}{" "}
                {moment(item.updated_at).local().format("h:mm A")}
              </label>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{renderItems}</ul>;
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
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("reputation.event")}
          >
            <label className="font-size-14">Event</label>
            {this.renderTriangle("reputation.event")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("reputation.type")}
          >
            <label className="font-size-14">Transaction Type</label>
            {this.renderTriangle("reputation.type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Earned/Returned/Lost</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Staked</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Pending</label>
          </div>
          <div
            className="c-col-7 c-cols"
            onClick={() => this.clickHeader("reputation.updated_at")}
          >
            <label className="font-size-14">Date</label>
            {this.renderTriangle("reputation.updated_at")}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    return (
      <Fade distance={"20px"} bottom duration={300} delay={600}>
        <section id="app-user-reputation-section" className="app-infinite-box">
          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}

              <div className="infinite-body handler-box">
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderItems()
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Reputation));
