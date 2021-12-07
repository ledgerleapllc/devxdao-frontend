import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import Helper from "../../../../utils/Helper";
import { showAlert, showCanvas, hideCanvas } from "../../../../redux/actions";
import { submitProposalChange } from "../../../../utils/Thunk";
import ProposalMilestoneView from "../../shared/proposal-milestone/ProposalMilestone";
import ProposalCitationView from "../proposal-citation/ProposalCitation";
// eslint-disable-next-line no-undef
const moment = require("moment");

import "./proposal-change-form.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ProposalChangeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: true,
      what_section: "",
      change_to: "",
      additional_notes: "",
      current_submission: "",
      current_submission_id: null,
    };
  }

  closeForm = (e) => {
    e.preventDefault();
    const { onClose } = this.props;
    if (onClose) onClose();
  };

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.checkButtonStatus();
    });
  }

  inputEuroField(e, key) {
    let value = e.target.value;
    value = Helper.unformatPriceNumber(value);

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    this.setState({ [key]: value }, () => {
      this.checkButtonStatus();
    });
  }

  selectWhatSection = (e) => {
    const { proposal } = this.props;
    const what_section = e.target.value;
    let current_submission = "";
    let current_submission_id = null;

    if (what_section == "short_description")
      current_submission = proposal.short_description;
    else if (what_section == "total_grant")
      current_submission = proposal.total_grant.toString();
    else if (what_section == "previous_work")
      current_submission = proposal.previous_work;
    else if (what_section == "other_work")
      current_submission = proposal.other_work;
    else if (what_section == "milestone") {
      current_submission = {
        milestones: proposal.milestones,
        total_grant: proposal.total_grant,
      };
      current_submission_id = proposal.milestones[0].id;
    } else if (what_section == "citation") {
      current_submission = {
        citations: proposal.citations,
      };
      current_submission_id = proposal.citations[0]
        ? proposal.citations[0].id
        : null;
    }

    this.setState(
      {
        change_to: "",
        additional_notes: "",
        what_section,
        current_submission,
        current_submission_id,
      },
      () => {
        this.checkButtonStatus();
      }
    );
  };

  selectMilestone = (e) => {
    this.setState(
      {
        ...this.state,
        current_submission_id: e.target.value,
        change_to: "",
      },
      () => {
        this.checkButtonStatus();
      }
    );
  };

  selectCitation = (e) => {
    this.setState(
      {
        ...this.state,
        current_submission_id: e.target.value,
        change_to: "",
      },
      () => {
        this.checkButtonStatus();
      }
    );
  };

  checkCitationsError() {
    const { change_to, current_submission, current_submission_id } = this.state;
    if (!change_to) {
      return true;
    }
    const currentCitation = JSON.parse(change_to);
    let sum = 0;
    let error = false;

    if (
      !currentCitation.proposalId ||
      !currentCitation.explanation ||
      currentCitation.percentage == ""
    )
      error = true;
    else if (
      !currentCitation.checked ||
      !currentCitation.validProposal ||
      !currentCitation.proposal ||
      !currentCitation.proposal.id
    )
      error = true;
    else {
      if (current_submission_id && current_submission_id !== "new") {
        const filterCitation = current_submission.citations.filter(
          (x) => x.id !== current_submission_id
        );
        const total = filterCitation.reduce(
          (total, x) => total + +x.percentage,
          0
        );
        sum = total + +currentCitation.percentage;
      } else {
        const total = current_submission.citations.reduce(
          (total, x) => total + +x.percentage,
          0
        );
        sum = total + +currentCitation.percentage;
      }
    }

    if (!error && +sum > 100) error = true;
    return error;
  }

  checkMilestonesError() {
    const { change_to, current_submission, current_submission_id } = this.state;
    const { proposal } = this.props;
    if (!change_to) {
      return true;
    }

    let error = false;
    if (
      !proposal.total_grant ||
      parseFloat(Helper.unformatNumber(proposal.total_grant)) <= 0
    ) {
      error = true;
    } else {
      const milestone = JSON.parse(change_to);
      if (
        !milestone.title.trim() ||
        !milestone.details.trim() ||
        !milestone.criteria.trim() ||
        // !milestone.kpi.trim() ||
        !milestone.deadline.trim() ||
        !milestone.level_difficulty.trim() ||
        !milestone.checked
      ) {
        error = true;
      }

      const filterMiles = current_submission.milestones.filter(
        (x) => +x.id !== +current_submission_id
      );

      const total = filterMiles.reduce((total, x) => total + +x.grant, 0);
      if (proposal.total_grant < total + +milestone.grant) {
        error = true;
      }
    }
    return error;
  }

  checkButtonStatus() {
    const { what_section, change_to, additional_notes } = this.state;
    let buttonDisabled = true;
    if (what_section.trim() == "remove_membership" && additional_notes.trim()) {
      buttonDisabled = false;
    } else if (
      what_section.trim() == "citation" &&
      !this.checkCitationsError() &&
      additional_notes.trim()
    ) {
      buttonDisabled = false;
    } else if (
      what_section.trim() == "milestone" &&
      !this.checkMilestonesError() &&
      additional_notes.trim()
    ) {
      buttonDisabled = false;
    } else if (
      !["milestone", "citation", "remove_membership"].includes(what_section) &&
      change_to.trim() &&
      additional_notes.trim()
    ) {
      buttonDisabled = false;
    }

    this.setState({
      ...this.state,
      buttonDisabled,
    });
  }

  submitChange = (e) => {
    e.preventDefault();

    const { proposal, onClose } = this.props;
    const { what_section, change_to, additional_notes } = this.state;

    if (!what_section.trim()) {
      this.props.dispatch(
        showAlert("Please input what section you make a change to")
      );
      return;
    }

    if (!change_to.trim() && what_section != "remove_membership") {
      this.props.dispatch(showAlert("Please input what change you will make"));
      return;
    }

    if (!additional_notes.trim()) {
      this.props.dispatch(showAlert("Please input additional notes"));
      return;
    }

    if (what_section == "total_grant") {
      if (
        !change_to.trim() ||
        parseFloat(Helper.unformatNumber(change_to.toString())) <= 0
      ) {
        this.props.dispatch(showAlert("Please input valid total grant amount"));
        return;
      }
    }

    const params = {
      proposal: proposal.id,
      what_section,
      change_to,
      additional_notes,
      grant: 0,
    };

    this.props.dispatch(
      submitProposalChange(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            if (onClose) onClose();
            this.props.dispatch(
              showAlert("You've successfully proposed a change", "success")
            );
          }
        }
      )
    );
  };

  renderWhatSectionDropdown() {
    const { what_section } = this.state;
    const { proposal } = this.props;

    return (
      <>
        <div className="d-block mb-20">
          <label className="mb-12">What Section?</label>
          <select value={what_section} onChange={this.selectWhatSection}>
            <option value="">Select...</option>
            <option value="short_description">Proposal Description</option>
            {proposal.type == "grant" ? (
              <>
                <option value="total_grant">Grant Total</option>
                <option value="previous_work">{`OP's Previous Work`}</option>
                <option value="other_work">{`Other Previous Work`}</option>
              </>
            ) : null}
            {proposal.include_membership ? (
              <option value="remove_membership">Remove Membership</option>
            ) : null}
            {proposal.milestones.length > 0 ? (
              <option value="milestone">Milestone</option>
            ) : null}
            <option value="citation">Citation</option>
          </select>
        </div>
        {what_section === "milestone" && (
          <div className="d-block mb-20">
            <label className="mb-12">What Milestone?</label>
            <select
              value={this.state.current_submission_id}
              onChange={this.selectMilestone}
            >
              {proposal.milestones.map((mile, ind) => (
                <option value={mile.id} key={ind}>
                  {mile.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {what_section === "citation" && (
          <div className="d-block mb-20">
            <label className="mb-12">What Citation?</label>
            <select
              value={this.state.current_submission_id}
              onChange={this.selectCitation}
            >
              {proposal.citations.map((citation, ind) => (
                <option value={citation.id} key={ind}>
                  Citation {ind + 1}
                </option>
              ))}
              <option value="new" key="new">
                + New Citation
              </option>
            </select>
          </div>
        )}
      </>
    );
  }

  renderMilestone() {
    const { current_submission, current_submission_id } = this.state;
    const milestone = current_submission.milestones.find(
      (x) => x.id == current_submission_id
    );
    return (
      <div key={`milestone_${current_submission_id}`}>
        <label className="font-weight-700 d-block mb-12">
          Title of Milestone (10 word limit)
        </label>
        <p className="mb-20">{milestone.title}</p>
        <label className="font-weight-700 d-block mb-12">
          Details of what will be delivered in milestone
        </label>
        <p className="mb-20">{milestone.details}</p>
        <label className="font-weight-700 d-block mb-12">
          {`Acceptance criteria: Please enter the specific details on what
            the deliverable must do to prove this milestone is complete.`}
        </label>
        <p className="mb-20">{milestone.criteria}</p>
        {/* <label className="font-weight-700 d-block mb-12">
          {`Please detail the KPIs (Key Performance Indicators) for each milestone and your project overall. Please provide as many details as possible. Any KPIs should measure your delivery's performance.`}
        </label>
        <p className="mb-20">{milestone.kpi}</p> */}
        <label className="font-weight-700 d-block mb-12">
          Grant portion requested for this milestone
        </label>
        <p className="mb-20">
          {Helper.formatPriceNumber(milestone.grant.toString())}
        </p>
        <label className="font-weight-700 d-block mb-12">Deadline</label>
        <p className="mb-20">
          {milestone.deadline
            ? moment(milestone.deadline).format("M/D/YYYY")
            : ""}
        </p>
        <label className="font-weight-700 d-block mb-12">
          Level of Difficulty
        </label>
        <p className="mb-20">{milestone.level_difficulty}</p>
      </div>
    );
  }

  renderCitation() {
    const { current_submission, current_submission_id } = this.state;
    const citation = current_submission.citations.find(
      (x) => x.id == current_submission_id
    );
    return (
      <div>
        <label className="font-weight-700 d-block mb-12">{`Cited Proposal Number`}</label>
        <p className="mb-20">{citation.rep_proposal_id}</p>
        <label className="font-weight-700 d-block mb-12">{`Cited Proposal Title`}</label>
        <p className="mb-20">{citation.rep_proposal.title}</p>
        <label className="font-weight-700 d-block mb-12">{`Cited Proposal OP`}</label>
        <p className="mb-20">{citation.rep_proposal.user.profile.forum_name}</p>
        <label className="font-weight-700 d-block mb-12">{`Explain how this work is foundational to your work`}</label>
        <p className="mb-20">{citation.explanation}</p>
        <label className="font-weight-700 d-block mb-12">{`% of the rep gained from this proposal do you wish to give to the OP of the prior work`}</label>
        <p className="mb-20">{citation.percentage}</p>
      </div>
    );
  }

  renderCurrentSubmission() {
    const {
      current_submission,
      what_section,
      current_submission_id,
    } = this.state;
    if (!current_submission) return null;

    if (what_section == "total_grant") {
      return (
        <div className="c-form-row">
          <label>Current Submission</label>
          <div className="app-readonly-box">
            {Helper.formatPriceNumber(current_submission)} Euro
          </div>
        </div>
      );
    }

    if (what_section === "milestone") {
      return (
        <div className="c-form-row">
          <label>Change From</label>
          <div className="app-box">{this.renderMilestone()}</div>
        </div>
      );
    }

    if (what_section === "citation") {
      if (!current_submission_id || current_submission_id === "new") {
        return <></>;
      }
      return (
        <div className="c-form-row">
          <label>Change From</label>
          <div className="app-box">{this.renderCitation()}</div>
        </div>
      );
    }

    return (
      <div className="c-form-row">
        <label>Current Submission</label>
        <div className="app-readonly-box">{current_submission}</div>
      </div>
    );
  }

  renderChangeTo() {
    const {
      change_to,
      what_section,
      current_submission,
      current_submission_id,
    } = this.state;

    if (what_section == "remove_membership") return null;
    if (
      [
        "",
        "short_description",
        "total_grant",
        "previous_work",
        "other_work",
      ].includes(what_section)
    ) {
      return (
        <div className="c-form-row">
          <label>Change to:</label>
          {what_section != "total_grant" ? (
            <textarea
              value={change_to}
              onChange={(e) => this.inputField(e, "change_to")}
            ></textarea>
          ) : (
            <div>
              <input
                type="text"
                value={Helper.formatPriceNumber(change_to.toString())}
                onChange={(e) => this.inputEuroField(e, "change_to")}
              />
              <label>Euro</label>
            </div>
          )}
        </div>
      );
    } else if (what_section === "milestone") {
      let cloneMilestones = JSON.parse(
        JSON.stringify(current_submission.milestones)
      );
      const currentIdx = cloneMilestones.findIndex(
        (x) => x.id == current_submission_id
      );
      const grant = cloneMilestones[currentIdx].grant;
      let currentMile;
      if (change_to) {
        currentMile = JSON.parse(change_to);
      } else {
        currentMile = cloneMilestones[currentIdx];
      }

      return (
        <div className="c-form-row">
          <label>Change to:</label>
          <div className="app-box">
            <ProposalMilestoneView
              showAction={false}
              total_grant={grant}
              milestones={[currentMile]}
              onUpdate={(milestones) => {
                this.setState(
                  {
                    ...this.state,
                    change_to: JSON.stringify(milestones[0]),
                  },
                  () => {
                    this.checkButtonStatus();
                  }
                );
              }}
            />
          </div>
        </div>
      );
    } else if (what_section === "citation") {
      let cloneCitations = JSON.parse(
        JSON.stringify(current_submission.citations)
      );
      const currentIdx = cloneCitations.findIndex(
        (x) => x.id == current_submission_id
      );
      let currentCitation;
      if (change_to) {
        currentCitation = JSON.parse(change_to);
      } else {
        currentCitation = cloneCitations[currentIdx];
      }
      let sum =
        100 -
        current_submission.citations.reduce(
          (total, x) => total + +x.percentage,
          0
        );
      if (current_submission_id && current_submission_id !== "new") {
        sum = +sum + +current_submission.citations[currentIdx].percentage;
      }

      return (
        <div className="c-form-row">
          <label>Change to:</label>
          <div className="app-box">
            <ProposalCitationView
              showAction={false}
              checkCustomSum={sum}
              citations={
                currentCitation
                  ? [currentCitation]
                  : [
                      {
                        proposalId: "",
                        explanation: "",
                        percentage: "",
                        validProposal: false,
                        checked: false,
                        proposal: {},
                      },
                    ]
              }
              onUpdate={(citations) => {
                const cita = {
                  ...citations[0],
                  rep_proposal: citations[0].proposal,
                  rep_proposal_id: citations[0].proposal
                    ? citations[0].proposal.id
                    : null,
                };
                this.setState(
                  {
                    ...this.state,
                    change_to: JSON.stringify(cita),
                  },
                  () => {
                    this.checkButtonStatus();
                  }
                );
              }}
            />
          </div>
        </div>
      );
    }
  }

  handleKeyDown = (e) => {
    if (e.key == "Tab") {
      e.preventDefault();
      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;
      e.target.value =
        e.target.value.substring(0, start) +
        "\t" +
        e.target.value.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 1;
    }
  };

  render() {
    const { proposal } = this.props;
    if (!proposal || !proposal.id) return null;

    const { buttonDisabled, additional_notes } = this.state;

    return (
      <section id="app-proposal-change-form-section">
        <form method="POST" action="" onSubmit={this.submitChange}>
          <div id="app-single-proposal-formTitle">
            <label>Suggest a Change</label>
            <Icon.Info size={16} />
          </div>
          <div className="c-form-row what-section">
            {this.renderWhatSectionDropdown()}
          </div>
          {this.renderCurrentSubmission()}
          {this.renderChangeTo()}
          <div className="c-form-row">
            <label>Additional Notes/References</label>
            <textarea
              onKeyDown={(e) => this.handleKeyDown(e)}
              value={additional_notes}
              onChange={(e) => this.inputField(e, "additional_notes")}
            ></textarea>
          </div>
          <div id="c-form-buttons">
            <button
              type="submit"
              className="btn btn-primary-outline less-small"
              disabled={buttonDisabled}
            >
              Propose Change
            </button>
            <button
              type="button"
              className="btn btn-danger-outline less-small"
              onClick={this.closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalChangeForm);
