import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import Helper from "../../../../../utils/Helper";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { getProposalsByUser } from "../../../../../utils/Thunk";

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
      calling: false,
    };

    this.timer = null;
  }

  componentDidMount() {
    this.getProposals();
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ proposals: [] }, () => {
      this.getProposals();
    });
  }

  getProposals(showLoading = true) {
    let { calling, loading, sort_key, sort_direction, proposals } = this.state;
    const { userId } = this.props;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      getProposalsByUser(
        userId,
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          this.setState({
            loading: false,
            calling: false,
            proposals: [...proposals, ...result],
          });
        }
      )
    );
  }

  clickRow(item) {
    const { history } = this.props;
    history.push(`/app/proposal/${item.id}`);
  }

  renderTitle(item) {
    let title = item.title;
    return title;
  }

  renderInformalResult(item) {
    const { votes } = item;
    if (!votes || !votes.length) return null;

    const informalVote = votes[0];
    if (informalVote.status == "completed") {
      if (informalVote.result == "success")
        return this.renderStatusLabel("Passed", "success");
      else if (informalVote.result == "no-quorum")
        return this.renderStatusLabel("No Quorum", "danger");
      return this.renderStatusLabel("Failed", "danger");
    }
    return null;
  }

  renderFormalResult(item) {
    const { votes } = item;
    if (!votes || !votes.length || votes.length < 2) return null;

    const formalVote = votes[1];
    if (formalVote.status == "completed") {
      if (formalVote.result == "success")
        return this.renderStatusLabel("Passed", "success");
      else if (formalVote.result == "no-quorum")
        return this.renderStatusLabel("No Quorum", "danger");
      return this.renderStatusLabel("Failed", "danger");
    }
    return null;
  }

  // Render Status Label
  renderStatusLabel(text, type) {
    return <label className={`font-size-14 color-${type}`}>{text}</label>;
  }

  // Render Status
  renderStatus(item) {
    const { dos_paid } = item;
    if (item.status == "payment") {
      if (dos_paid) return this.renderStatusLabel("Payment Clearing", "info");
      else return this.renderStatusLabel("Payment Waiting", "info");
    } else if (item.status == "pending")
      return this.renderStatusLabel("Pending", "primary");
    else if (item.status == "denied")
      return this.renderStatusLabel("Denied", "danger");
    else if (item.status == "completed")
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
          <div className="infinite-row">
            <div className="c-col-1 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14 font-weight-700">{item.id}</label>
            </div>
            <div className="c-col-2 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
              <p className="font-size-12">
                {Helper.getExcerpt(
                  item.short_description || item.member_reason
                )}
              </p>
            </div>
            <div className="c-col-3 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">
                {item.type == "grant" ? "Grant" : "Simple"}
              </label>
            </div>
            <div className="c-col-4 c-cols">{this.renderStatus(item)}</div>
            <div className="c-col-5 c-cols" onClick={() => this.clickRow(item)}>
              {this.renderInformalResult(item)}
            </div>
            <div className="c-col-6 c-cols" onClick={() => this.clickRow(item)}>
              {this.renderFormalResult(item)}
            </div>
            <div className="c-col-7 c-cols" onClick={() => this.clickRow(item)}>
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
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Proposal #</label>
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
            onClick={() => this.clickHeader("proposal.type")}
          >
            <label className="font-size-14">Type</label>
            {this.renderTriangle("proposal.type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Status</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Informal Result</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Formal Result</label>
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
    const { loading } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    return (
      <Fade distance={"20px"} bottom duration={300} delay={600}>
        <section id="app-user-proposals-section" className="app-infinite-box">
          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}

              <div className="infinite-body handler-box">
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
