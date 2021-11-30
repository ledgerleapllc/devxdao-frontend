import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import Helper from "../../../../utils/Helper";
import {
  approveProposalChange,
  denyProposalChange,
  supportUpProposalChange,
  supportDownProposalChange,
  withdrawProposalChange,
  forceApproveProposalChange,
  forceDenyProposalChange,
  forceWithdrawProposalChange,
} from "../../../../utils/Thunk";
import { showAlert, showCanvas, hideCanvas } from "../../../../redux/actions";
import {
  OP_WHAT_SECTION_ACTIONS,
  OP_SCOPES,
  OP_WHAT_SECTION_SIMPLE_ACTIONS,
  OP_WHAT_SECTION_COMPLICATE_ACTIONS,
  LICENSES,
  GRANTTYPES,
} from "../../../../utils/Constant";
import "./single-change-detail.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
  };
};

class SingleChangeDetail extends Component {
  forceApproveChange = (e) => {
    e.preventDefault();
    if (
      !confirm(
        "Are you sure you are going to force approve this proposed change?"
      )
    )
      return;

    const { proposal, proposalChange, history } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      forceApproveProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            history.push(`/app/proposal/${proposal.id}`);
            this.props.dispatch(
              showAlert(
                "You've successfully force approved this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  forceDenyChange = (e) => {
    e.preventDefault();
    if (
      !confirm("Are you sure you are going to force deny this proposed change?")
    )
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      forceDenyProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully force denied this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  forceWithdrawChange = (e) => {
    e.preventDefault();
    if (
      !confirm(
        "Are you sure you are going to force withdraw this proposed change?"
      )
    )
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      forceWithdrawProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully force withdrawn your proposed change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  forChange = (e) => {
    e.preventDefault();
    if (
      !confirm("Are you sure you are going to support UP this proposed change?")
    )
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      supportUpProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully supported UP this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  againstChange = (e) => {
    e.preventDefault();
    if (
      !confirm(
        "Are you sure you are going to support DOWN this proposed change?"
      )
    )
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      supportDownProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully supported DOWN this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  approveChange = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to approve this proposed change?"))
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      approveProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully approved this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  denyChange = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to deny this proposed change?"))
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      denyProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully denied this proposal change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  withdrawChange = (e) => {
    e.preventDefault();
    if (
      !confirm("Are you sure you are going to withdraw this proposed change?")
    )
      return;

    const { proposalChange, onRefresh } = this.props;
    if (!proposalChange || !proposalChange.id) return;

    this.props.dispatch(
      withdrawProposalChange(
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onRefresh) onRefresh();
            this.props.dispatch(
              showAlert(
                "You've successfully withdrawn your proposed change",
                "success"
              )
            );
          }
        }
      )
    );
  };

  renderWhatSection() {
    const { proposalChange } = this.props;
    switch (proposalChange.what_section) {
      case "files":
        return "Files";
      case "short_description":
        return "Proposal Description";
      case "total_grant":
        return "Grant Total";
      case "previous_work":
        return "OP's Previous Work";
      case "other_work":
        return "Other Previous Work";
      case "remove_membership":
        return "Remove Membership";
      case "milestone":
        return "Milestone";
      case "citation":
        return "Citation";
      case "total_grant_update":
        return "Euro amount requested";
      case "things_delivered_update":
        return "What is being delivered for the DxD/ETA?";
    }
  }

  renderOPChanges(changeObj) {
    const obj = changeObj.what_section.split("_");
    obj.pop();
    let scope = obj.join("_");

    return OP_SCOPES[scope];
  }

  renderButtons() {
    const { authUser, proposal, proposalChange, settings } = this.props;

    // Status Check
    if (proposal.status != "approved") return null;
    if (proposalChange.status != "pending") return null;

    // Vote Check
    if (proposal.votes && proposal.votes.length) return null;

    if (authUser.is_admin) {
      // Admin
      return (
        <Fragment>
          <a
            id="app-scd-force-approve-btn"
            className="btn btn-primary-outline btn-fluid less-small"
            onClick={this.forceApproveChange}
          >
            FORCE Approve Change
          </a>
          <a
            id="app-scd-force-deny-btn"
            className="btn btn-danger-outline btn-fluid less-small"
            onClick={this.forceDenyChange}
          >
            FORCE Deny Change
          </a>
          <a
            className="btn btn-danger btn-fluid less-small"
            onClick={this.forceWithdrawChange}
          >
            FORCE Withdraw Suggested Change
          </a>
        </Fragment>
      );
    } else if (proposal.user_id == authUser.id) {
      // OP
      if (
        !settings ||
        !settings.time_before_op_do ||
        !settings.time_unit_before_op_do
      )
        return null;

      let mins = 0;
      if (settings.time_unit_before_op_do == "min")
        mins = parseInt(settings.time_before_op_do);
      else if (settings.time_unit_before_op_do == "hour")
        mins = parseInt(settings.time_before_op_do) * 60;
      else if (settings.time_unit_before_op_do == "day")
        mins = parseInt(settings.time_before_op_do) * 60 * 24;

      const diff = moment(proposalChange.created_at)
        .add(mins, "minutes")
        .diff(moment(), "hours");
      if (diff > 0) {
        return (
          <span className="color-danger">
            You will be able to approve or deny this change in {diff} hours
          </span>
        );
      } else {
        return (
          <Fragment>
            <a
              id="app-scd-approve-btn"
              className="btn btn-primary-outline btn-fluid less-small"
              onClick={this.approveChange}
            >
              Approve Change
            </a>
            <a
              className="btn btn-danger-outline btn-fluid less-small"
              onClick={this.denyChange}
            >
              Deny Change
            </a>
          </Fragment>
        );
      }
    } else if (proposalChange.user_id == authUser.id) {
      // OC
      return (
        <a
          className="btn btn-danger-outline btn-fluid less-small"
          onClick={this.withdrawChange}
        >
          Withdraw Suggested Change
        </a>
      );
    } else {
      if (!proposalChange.supported_by_you && authUser.is_member) {
        // Not OP, Not OC
        return (
          <Fragment>
            <a
              id="app-scd-for-btn"
              className="btn btn-primary-outline btn-fluid less-small"
              onClick={this.forChange}
            >
              For
            </a>
            <a
              className="btn btn-danger-outline btn-fluid less-small"
              onClick={this.againstChange}
            >
              Against
            </a>
          </Fragment>
        );
      }
    }
  }

  renderFiles(data) {
    const dataParsed = JSON.parse(data);
    const files = dataParsed.files;
    if (!files || !files.length) return null;

    const items = [];
    files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <p>{file.name || file.path}</p>
        </li>
      );
    });

    return (
      <div id="files-wrap">
        <ul>{items}</ul>
      </div>
    );
  }

  renderGrants(data) {
    const dataParsed = JSON.parse(data);
    const grants = dataParsed.grants || [];
    const items = [];

    if (grants) {
      grants.forEach((grant, index) => {
        items.push(
          <div
            className="d-flex app-spd-grant-item mb-5"
            key={`grant_${index}`}
          >
            <Icon.CheckSquare color="#9B64E6" />
            <div className="pl-4">
              <div className="d-flex">
                <label className="pr-3 font-weight-700">
                  {GRANTTYPES[grant.type]}
                </label>
                <span>{Helper.formatPriceNumber(grant.grant)}</span>
              </div>
              <span>{grant.type_other || ""}</span>
              <span className="font-size-14">
                Percentage kept by OP: {grant.percentage || 0}%
              </span>
            </div>
          </div>
        );
      });
    }

    return items;
  }

  renderOPChangeContent(lastestData = false) {
    const { proposalChange } = this.props;
    const content = !lastestData
      ? proposalChange.additional_notes
      : proposalChange.change_to;
    if (OP_WHAT_SECTION_SIMPLE_ACTIONS.includes(proposalChange.what_section)) {
      if (proposalChange.what_section.includes("license")) {
        return <p className="no-gutters">{this.renderLicense(content)}</p>;
      } else if (
        proposalChange.what_section.includes("is_company_or_organization")
      ) {
        return (
          <p className="no-gutters">{this.renderPaymentEntity(content)}</p>
        );
      } else if (proposalChange.what_section.includes("have_mentor")) {
        return <p className="no-gutters">{this.renderMentor(content)}</p>;
      } else if (proposalChange.what_section.includes("files")) {
        return <p className="no-gutters">{this.renderFiles(content)}</p>;
      } else if (proposalChange.what_section.includes("grants")) {
        return <p className="no-gutters">{this.renderGrants(content)}</p>;
      } else {
        return <p className="no-gutters">{content}</p>;
      }
    }
    if (
      OP_WHAT_SECTION_COMPLICATE_ACTIONS.includes(proposalChange.what_section)
    ) {
      if (proposalChange.what_section.includes("team_member")) {
        return <div>{this.renderMembers(content)}</div>;
      }
      if (proposalChange.what_section.includes("milestone")) {
        return <div>{this.renderMilestones(content)}</div>;
      }
      if (proposalChange.what_section.includes("citation")) {
        return <div>{this.renderCitations(content)}</div>;
      }
    }
    return <></>;
  }

  renderLicense(data) {
    const dataParse = JSON.parse(data);
    const licenseText = LICENSES.find((x) => +x.key === +dataParse.license)
      ?.title;
    const licenseOther = dataParse.license_other;
    if (licenseOther) {
      return `${licenseText} - ${licenseOther}`;
    } else {
      return licenseText;
    }
  }

  renderPaymentEntity(data) {
    const dataParse = JSON.parse(data);
    if (dataParse.is_company_or_organization) {
      return `Yes (${dataParse.name_entity} - ${dataParse.entity_country})`;
    }
    return "No";
  }

  renderMentor(data) {
    const dataParse = JSON.parse(data);
    if (dataParse.have_mentor) {
      return `Yes (${dataParse.name_mentor} - ${dataParse.total_hours_mentor})`;
    }
    return "No";
  }

  renderMembers(data) {
    const members = JSON.parse(data).members || [];
    const items = [];

    if (members) {
      members.forEach((member, index) => {
        items.push(
          <div key={`member_${index}`}>
            <label className="d-block mt-5 mb-5" style={{ color: "#9B64E6" }}>
              Team Member #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">Full Name</label>
            <p>{member.full_name}</p>
            <label className="font-weight-700 d-block">
              Education/Experience
            </label>
            <p>{member.bio}</p>
          </div>
        );
      });
      return items;
    } else {
      return "No Member";
    }
  }

  renderVAChangeTo() {
    const { proposalChange } = this.props;
    if (proposalChange.what_section == "total_grant") {
      return (
        <p>
          {Helper.formatPriceNumber(proposalChange.change_to.toString())} Euro
        </p>
      );
    } else if (proposalChange.what_section == "milestone") {
      const stringifyMileStone = JSON.stringify({
        milestones: [JSON.parse(proposalChange.change_to)],
      });
      return (
        <div className="change-detail-box">
          {this.renderMilestones(stringifyMileStone)}
        </div>
      );
    } else if (proposalChange.what_section == "citation") {
      const stringifyCitation = JSON.stringify({
        citations: [JSON.parse(proposalChange.change_to)],
      });
      return (
        <div className="change-detail-box">
          {this.renderCitations(stringifyCitation)}
        </div>
      );
    } else {
      return <p>{proposalChange.change_to}</p>;
    }
  }

  renderMilestones(data) {
    const milestones = JSON.parse(data).milestones || [];
    const items = [];
    if (milestones) {
      milestones.forEach((milestone, index) => {
        items.push(
          <div key={`milestone_${index}`}>
            <label className="d-block mt-3 mb-3" style={{ color: "#9B64E6" }}>
              Milestone #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">
              Title of Milestone (10 word limit)
            </label>
            <p>{milestone.title}</p>
            <label className="font-weight-700 d-block">
              Details of what will be delivered in milestone
            </label>
            <p className="text-pre-wrap">{milestone.details}</p>
            <label className="font-weight-700 d-block">
              {`Acceptance criteria: Please enter the specific details on what
                the deliverable must do to prove this milestone is complete.`}
            </label>
            <p className="text-pre-wrap">{milestone.criteria}</p>
            {/* <label className="font-weight-700 d-block">
              {`Please detail the KPIs (Key Performance Indicators) for each milestone and your project overall. Please provide as many details as possible. Any KPIs should measure your delivery's performance.`}
            </label>
            <p>{milestone.kpi}</p> */}
            <label className="font-weight-700 d-block">
              Grant portion requested for this milestone
            </label>
            <p>{Helper.formatPriceNumber(milestone.grant.toString())}</p>
            <label className="font-weight-700 d-block">Deadline</label>
            <p>
              {milestone.deadline
                ? moment(milestone.deadline).format("M/D/YYYY")
                : ""}
            </p>
            <label className="font-weight-700 d-block">
              Level of Difficulty
            </label>
            <p>{milestone.level_difficulty}</p>
          </div>
        );
      });
      return items;
    } else {
      return "No Milestone";
    }
  }

  renderCitations(data) {
    const citations = JSON.parse(data).citations || [];
    const items = [];
    if (citations && citations.length) {
      citations.forEach((citation, index) => {
        items.push(
          <div key={`citation_${index}`}>
            <label className="d-block mt-3 mb-3" style={{ color: "#9B64E6" }}>
              Citation #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">{`Cited Proposal Number`}</label>
            <p>{citation.rep_proposal_id}</p>
            <label className="font-weight-700 d-block">{`Cited Proposal Title`}</label>
            <p>{citation.rep_proposal.title}</p>
            <label className="font-weight-700 d-block">{`Cited Proposal OP`}</label>
            <p>{citation.rep_proposal.user.profile.forum_name}</p>
            <label className="font-weight-700 d-block">{`Explain how this work is foundational to your work`}</label>
            <p>{citation.explanation}</p>
            <label className="font-weight-700 d-block">{`% of the rep gained from this proposal do you wish to give to the OP of the prior work`}</label>
            <p>{citation.percentage}</p>
          </div>
        );
      });
      return items;
    } else {
      return "No citation";
    }
  }

  render() {
    const { proposal, proposalChange, proposalHistory, authUser } = this.props;

    if (
      !proposal ||
      !proposal.id ||
      !proposalChange ||
      !proposalChange.id ||
      !authUser ||
      !authUser.id
    )
      return null;

    return (
      <section id="app-single-change-detail-section">
        <div id="app-single-change-title">
          <label>Proposed Change</label>
          <Icon.Info size={16} />
        </div>
        <div id="app-single-change-body">
          {!OP_WHAT_SECTION_ACTIONS.includes(proposalChange.what_section) && (
            <>
              <label className="font-weight-700">What Section?</label>
              <p>{this.renderWhatSection()}</p>
              {proposalHistory &&
              proposalHistory.id &&
              proposalChange.what_section != "remove_membership" ? (
                <Fragment>
                  <label className="font-weight-700">Changed from:</label>
                  <p>
                    {proposalHistory.what_section == "total_grant"
                      ? Helper.formatPriceNumber(
                          proposalHistory.change_to_before.toString()
                        )
                      : proposalHistory.change_to_before}
                  </p>
                </Fragment>
              ) : null}

              {proposalChange.what_section != "remove_membership" ? (
                <Fragment>
                  <label className="font-weight-700">Change to:</label>
                  {this.renderVAChangeTo()}
                </Fragment>
              ) : null}

              <label className="font-weight-700">
                Additional Notes/References
              </label>
              <p className="text-pre-wrap">{proposalChange.additional_notes}</p>
              <div id="app-scd-btn-wrap">{this.renderButtons()}</div>
            </>
          )}
          {OP_WHAT_SECTION_ACTIONS.includes(proposalChange.what_section) && (
            <>
              <label className="font-weight-700">What Section?</label>
              <p>{this.renderOPChanges(proposalChange)}</p>
              <div>
                <>
                  <label className="font-weight-700">Before:</label>
                  <div className="change-detail-box">
                    {this.renderOPChangeContent()}
                  </div>
                </>
              </div>
              <div>
                <>
                  <label className="font-weight-700">After:</label>
                  <div className="change-detail-box">
                    {this.renderOPChangeContent(true)}
                  </div>
                </>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleChangeDetail));
