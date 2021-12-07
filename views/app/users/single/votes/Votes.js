import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { getVotesByUser } from "../../../../../utils/Thunk";

import "./votes.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Votes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
      sort_key: "vote_result.id",
      sort_direction: "desc",
      calling: false,
    };
  }

  componentDidMount() {
    this.getItems();
  }

  getItems(showLoading = true) {
    let { calling, loading, sort_key, sort_direction, items } = this.state;
    const { userId } = this.props;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      getVotesByUser(
        userId,
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.items || [];
          this.setState({
            loading: false,
            calling: false,
            items: [...items, ...result],
          });
        }
      )
    );
  }

  renderTitle(item) {
    let title = item.proposal.title;
    return title;
  }

  renderDirection(item) {
    if (item.type == "for")
      return <label className="font-size-14 color-success">For</label>;
    return <label className="font-size-14 color-danger">Against</label>;
  }

  renderStake(item) {
    if (item.value > 0)
      return <label className="font-size-14 color-success">{item.value}</label>;
    return <label className="font-size-14 color-danger">{item.value}</label>;
  }

  renderResult(item) {
    const vote = item.vote;
    if (vote.status == "completed") {
      if (vote.result == "success")
        return <label className="font-size-14 color-success">Passed</label>;
      else if (vote.result == "no-quorum")
        return <label className="font-size-14 color-danger">No Quorum</label>;
      return <label className="font-size-14 color-danger">Failed</label>;
    }
    return null;
  }

  renderItems() {
    const { items: records } = this.state;
    const items = [];

    if (!records || !records.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    records.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">
                {item.vote.type == "formal" ? "Formal" : "Informal"}
              </label>
            </div>
            <div className="c-col-3 c-cols">{this.renderDirection(item)}</div>
            <div className="c-col-4 c-cols">{this.renderStake(item)}</div>
            <div className="c-col-5 c-cols">{this.renderResult(item)}</div>
            <div className="c-col-6 c-cols">
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

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Proposal Title</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Type</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Direction</label>
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Stake</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Result</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Date</label>
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
      <Fade bottom duration={100} delay={100}>
        <section id="app-user-votes-section" className="app-infinite-box">
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

export default connect(mapStateToProps)(Votes);
