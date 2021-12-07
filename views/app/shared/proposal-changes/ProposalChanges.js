import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  getProposalChanges,
  getPublicProposalChanges,
} from "../../../../utils/Thunk";
import { withRouter } from "react-router-dom";
import {
  OP_WHAT_SECTION_ACTIONS,
  OP_SCOPES,
  OP_ACTIONS,
} from "../../../../utils/Constant";
import {
  Card,
  CardHeader,
  CardBody,
  CardPreview,
} from "../../../../components";

import "./proposal-changes.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ProposalChanges extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changes: [],
    };
  }

  componentDidMount() {
    this.getProposalChanges();
  }

  getProposalChanges() {
    const { proposal, isPublic } = this.props;
    if (isPublic) {
      this.props.dispatch(
        getPublicProposalChanges(
          proposal.id,
          () => {},
          (res) => {
            let changes = res.changes || [];
            const general = changes.find(
              (change) => change.what_section === "general_discussion"
            );
            if (general) {
              changes = changes.filter(
                (change) => change.what_section !== "general_discussion"
              );
              changes = [general, ...changes];
            }
            this.setState({ changes });
          }
        )
      );
    } else {
      this.props.dispatch(
        getProposalChanges(
          proposal.id,
          () => {},
          (res) => {
            let changes = res.changes || [];
            const general = changes.find(
              (change) => change.what_section === "general_discussion"
            );
            if (general) {
              changes = changes.filter(
                (change) => change.what_section !== "general_discussion"
              );
              changes = [general, ...changes];
            }
            this.setState({ changes });
          }
        )
      );
    }
  }

  showForm = (e) => {
    e.preventDefault();
    const { onShow } = this.props;
    if (onShow) onShow();
  };

  clickChanges(change) {
    const { proposal, history } = this.props;
    if (!proposal || !proposal.id) return;

    history.push(`/app/proposal/${proposal.id}/change/${change.id}`);
  }

  renderType(change) {
    if (change.what_section) {
      const what_section = change.what_section;
      if (what_section == "short_description") return "Proposal Description";
      else if (what_section == "total_grant") return "Grant Total";
      else if (what_section == "previous_work") return "OP's Previous Work";
      else if (what_section == "other_work") return "Other Previous Work";
      else if (what_section == "remove_membership") return "Remove Membership";
      else if (what_section == "milestone") return "Milestone";
      else if (what_section == "citation") return "Citation";
    }
    return "";
  }

  renderSupport(change) {
    let up_count = change.up_count || 0;
    up_count = parseInt(up_count);
    let down_count = change.down_count || 0;
    down_count = parseInt(down_count);

    let total_count = up_count + down_count;

    if (total_count) {
      const percentage = parseInt((100 * up_count) / total_count);

      return (
        <div className="app-proposal-changes-item__support">
          <span>{percentage}%</span> | <span>{100 - percentage}%</span>
        </div>
      );
    }

    return (
      <div className="app-proposal-changes-item__support">
        <span>0%</span> | <span>0%</span>
      </div>
    );
  }

  // Active Title Part
  renderActiveTitle(change) {
    let forumName = "";
    if (change && change.user && change.user.profile)
      forumName = change.user.profile.forum_name || "";

    if (change && change.what_section === "general_discussion") {
      return (
        <>
          <span style={{ marginLeft: -10, marginTop: -7 }}>
            <img src="/pin.png" alt="pin" />
          </span>
          <b>General Discussion Thread</b> -{" "}
        </>
      );
    } else {
      return (
        <>
          <span className="active-pc"></span>
          Change to <b>{this.renderType(change)}</b> by <b>{forumName}</b> -{" "}
        </>
      );
    }
  }

  // Inactive Title Part
  renderInactiveTitle(change) {
    let forumName = "";
    if (change && change.user && change.user.profile)
      forumName = change.user.profile.forum_name || "";

    return (
      <Fragment>
        <span className="inactive-pc"></span>
        Change to <b>{this.renderType(change)}</b> by <b>{forumName}</b> -{" "}
      </Fragment>
    );
  }

  // Full Title
  renderTitle(change) {
    if (change.status != "pending") {
      if (change.status == "approved") {
        return (
          <label className="font-size-14">
            {this.renderInactiveTitle(change)}
            <b className="color-success">THE OP APPROVED THIS CHANGE</b> -{" "}
            {moment(change.updated_at).fromNow()}
          </label>
        );
      } else if (change.status == "denied") {
        return (
          <label className="font-size-14">
            {this.renderInactiveTitle(change)}
            <b className="color-danger">THE OP DENIED THIS CHANGE</b> -{" "}
            {moment(change.updated_at).fromNow()}
          </label>
        );
      } else if (change.status == "withdrawn") {
        return (
          <label className="font-size-14">
            {this.renderInactiveTitle(change)}
            <b className="color-primary">THE OC WITHDREW THIS CHANGE</b> -{" "}
            {moment(change.updated_at).fromNow()}
          </label>
        );
      }
    }

    return (
      <label className="font-size-14">
        {this.renderActiveTitle(change)}
        {moment(change.created_at).fromNow()}
      </label>
    );
  }

  renderBadge(change) {
    return (
      <div className="custom-badge">
        {change.status == "pending" ? (
          <a className="btn btn-warning extra-small btn-fluid-small">{`Needs Action`}</a>
        ) : null}
      </div>
    );
  }

  renderOPChanges(changeObj) {
    const obj = changeObj.what_section.split("_");
    let action = obj.pop();
    let scope = obj.join("_");
    let isA = ["team_member", "milestone", "citation"].includes(scope);

    return (
      <p>
        OP {OP_ACTIONS[action]} {isA ? "a" : ""} <b>{OP_SCOPES[scope]}</b> -{" "}
        {moment(changeObj.created_at).fromNow()}
      </p>
    );
  }

  renderItems() {
    const { changes } = this.state;
    const items = [];

    if (changes) {
      changes.forEach((change, index) => {
        items.push(
          <div
            key={`changes_${index}`}
            className="app-proposal-changes-item"
            onClick={() => this.clickChanges(change)}
          >
            {!OP_WHAT_SECTION_ACTIONS.includes(change.what_section) && (
              <>
                {this.renderTitle(change)}
                {change &&
                  change.what_section !== "general_discussion" &&
                  this.renderBadge(change)}
                {change && change.what_section !== "general_discussion" && (
                  <div className="app-proposal-changes-item__comments">
                    <Icon.MessageCircle size={20} />
                    <span className="font-size-12">{change.comments}</span>
                  </div>
                )}
                {change &&
                  change.what_section !== "general_discussion" &&
                  this.renderSupport(change)}
              </>
            )}
            {OP_WHAT_SECTION_ACTIONS.includes(change.what_section) && (
              <>{this.renderOPChanges(change)}</>
            )}
          </div>
        );
      });
    }

    return items;
  }

  render() {
    const { proposal, authUser, isPublic, isAutoExpand } = this.props;
    if (!isPublic && (!proposal || !proposal.id || !authUser || !authUser.id)) {
      return null;
    }
    return (
      <section id="app-proposal-changes-list-section">
        {proposal.user_id != authUser.id &&
        (!proposal.votes || !proposal.votes.length) &&
        authUser.is_member ? (
          <div id="proposal-change-btn-wrap">
            <a
              className="btn btn-primary-outline less-small"
              onClick={this.showForm}
            >
              Propose a change
            </a>
          </div>
        ) : null}
        <div id="app-proposal-changes-list">
          <Card isAutoExpand={isAutoExpand}>
            <CardHeader>
              <label className="pr-2">Proposed Changes & Discussions</label>
              <Icon.Info size={16} />
            </CardHeader>
            <CardPreview>
              <div className="d-flex">
                <div className="pr-4">
                  <p className="pb-2">Comments</p>
                  <div className="d-flex align-items-center">
                    <Icon.MessageCircle size={16} />
                    <p className="pl-2">
                      {this.state.changes?.reduce(
                        (sum, x) => sum + x.comments,
                        0
                      )}
                    </p>
                  </div>
                </div>
                <div className="pr-4">
                  <p className="pb-2">Changes</p>
                  <div className="d-flex align-items-center">
                    <Icon.Edit size={16} />
                    <p className="pl-2">{this.state.changes?.length}</p>
                  </div>
                </div>
              </div>
            </CardPreview>
            <CardBody>
              <div className="app-simple-section__body">
                {this.renderItems()}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ProposalChanges));
