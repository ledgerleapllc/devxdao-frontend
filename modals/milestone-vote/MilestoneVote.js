import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  hideCanvas,
  removeActiveModal,
  setActiveModal,
  setGrantTableStatus,
  setMilestoneVoteData,
  showCanvas,
} from "../../redux/actions";
import { Checkbox, FormInputComponent } from "../../components";
import { submitMilestone } from "../../utils/Thunk";

import "./milestone-vote.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    milestoneVoteData: state.modal.milestoneVoteData,
  };
};

class MilestoneVote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      milestoneId: 0,
      index: 0,
      title: "",
      details: "",
      criteria: "",
      // kpi: "",
      grant: "",
      checked: false,
      url: "",
      comment: "",
      proposal: {},
      attest_accepted_definition: 0,
      attest_accepted_pm: 0,
      attest_submitted_accounting: 0,
      attest_work_adheres: 0,
      attest_submitted_corprus: 0,
      attest_accept_crdao: 0,
    };
  }

  componentDidMount() {
    const { milestoneVoteData } = this.props;
    this.setState({
      index: milestoneVoteData.index,
      milestoneId: milestoneVoteData.milestone.id,
      title: milestoneVoteData.milestone.title || "",
      details: milestoneVoteData.milestone.details || "",
      criteria: milestoneVoteData.milestone.criteria || "",
      // kpi: milestoneVoteData.milestone.kpi || "",
      grant: milestoneVoteData.milestone.grant || "",
      proposal: milestoneVoteData.proposal,
      url: milestoneVoteData.milestone.url || "",
      comment: milestoneVoteData.milestone.comment || "",
    });
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setMilestoneVoteData({}));
  };

  submit = (e) => {
    const submittingMilestones = this.props?.data?.submittingMilestones;
    e.preventDefault();
    const {
      milestoneId,
      proposal,
      url,
      comment,
      grant,
      attest_accepted_definition,
      attest_accepted_pm,
      attest_submitted_accounting,
      attest_work_adheres,
      attest_submitted_corprus,
      attest_accept_crdao,
    } = this.state;
    if (!url.trim() || !comment.trim()) return;

    const params = {
      milestoneId,
      proposalId: proposal.id,
      url,
      comment,
      grant,
      attest_accepted_definition,
      attest_accepted_pm,
      attest_submitted_accounting,
      attest_work_adheres,
      attest_submitted_corprus,
      attest_accept_crdao,
    };

    this.props.dispatch(
      submitMilestone(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            if (submittingMilestones && submittingMilestones?.length > 1) {
              const submissionIndex = submittingMilestones.findIndex(
                (x) => x.milestone.id === milestoneId
              );
              this.hideModal();
              if (submissionIndex < submittingMilestones.length - 1) {
                await this.props.dispatch(
                  setMilestoneVoteData(
                    submittingMilestones[submissionIndex + 1]
                  )
                );
                await this.props.dispatch(
                  setActiveModal("milestone-vote", { submittingMilestones })
                );
              } else {
                this.hideModal();
                this.props.dispatch(setGrantTableStatus(true));
                if (this.props.settings.gate_new_milestone_votes === "yes") {
                  this.props.dispatch(setActiveModal("start-milestone"));
                }
              }
            } else {
              this.hideModal();
              this.props.dispatch(setGrantTableStatus(true));
              if (this.props.settings.gate_new_milestone_votes === "yes") {
                this.props.dispatch(setActiveModal("start-milestone"));
              }
            }
          }
        }
      )
    );
  };

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  checkField(e, key) {
    this.setState({ [key]: e ? 1 : 0 });
  }

  isDisabledSubmit = () => {
    const {
      attest_accepted_definition,
      attest_accepted_pm,
      attest_submitted_accounting,
      attest_work_adheres,
      attest_submitted_corprus,
      attest_accept_crdao,
    } = this.state;
    return (
      !attest_accepted_definition ||
      !attest_accepted_pm ||
      !attest_submitted_accounting ||
      !attest_work_adheres ||
      !attest_submitted_corprus ||
      !attest_accept_crdao
    );
  };

  render() {
    const submittingMilestones = this.props?.data?.submittingMilestones;
    const { milestoneVoteData, authUser } = this.props;
    if (
      !milestoneVoteData ||
      !milestoneVoteData.proposal ||
      !authUser ||
      !authUser.id
    )
      return null;

    const {
      index,
      title,
      details,
      criteria,
      grant,
      proposal,
      url,
      comment,
      attest_accepted_definition,
      attest_accepted_pm,
      attest_submitted_accounting,
      attest_work_adheres,
      attest_submitted_corprus,
      attest_accept_crdao,
    } = this.state;

    let submissionIndex;
    if (submittingMilestones?.length) {
      submissionIndex = submittingMilestones.findIndex(
        (x) => x.milestone.id === milestoneVoteData.milestone.id
      );
    }

    return (
      <div id="milestone-vote-modal">
        {submittingMilestones?.length && (
          <span className="multiple-selected-top">
            Milestone submission {submissionIndex + 1} of{" "}
            {submittingMilestones.length} selected
          </span>
        )}
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h3>
          You are submitting milestone#{index + 1} for {proposal.title}
        </h3>

        <form onSubmit={this.submit}>
          <div className="c-form-row mt-4">
            <label>Milestone Title:</label>
            <p className="font-weight-700">{title}</p>
          </div>
          <div className="c-form-row">
            <label>Show details of what will be delivered</label>
            <p className="font-weight-700">{details}</p>
          </div>
          <div className="c-form-row">
            <label>Show acceptance criteria</label>
            <p className="font-weight-700">{criteria}</p>
          </div>
          {/* <div className="c-form-row">
            <label>Please detail the KPIs</label>
            <p className="font-weight-700">{kpi}</p>
          </div> */}
          <div className="c-form-row">
            <label>Grant portion released</label>
            <p className="font-weight-700">{grant}</p>
          </div>
          <div className="c-form-row">
            <label>{`Please enter the URL of the repository or drive where the completed work has been made available.`}</label>
            <FormInputComponent
              value={url}
              required
              onChange={(e) => this.inputField(e, "url")}
            />
          </div>
          <div className="c-form-row">
            <label>{`Please provide comments and notes regarding the completion of the work. If this is the second or further submission of this milestone, please explain what changes you have made since the last submission.`}</label>
            <textarea
              value={comment}
              required
              onChange={(e) => this.inputField(e, "comment")}
              className="custom-form-control"
              style={{ height: "150px", resize: "none" }}
            ></textarea>
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_accepted_definition}
              onChange={(e) => this.checkField(e, "attest_accepted_definition")}
              text="I attest that I have accepted the Definition of Done that I submitted with my original proposal and grant."
            />
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_accepted_pm}
              onChange={(e) => this.checkField(e, "attest_accepted_pm")}
              text="I attest that I have accepted the program management terms and conditions when i registered for this portal."
            />
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_submitted_accounting}
              onChange={(e) =>
                this.checkField(e, "attest_submitted_accounting")
              }
              text="I attest that the work submitted represents a full accounting of the deliverables in the milestone."
            />
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_work_adheres}
              onChange={(e) => this.checkField(e, "attest_work_adheres")}
              text="I attest that the work adheres to the acceptance criteria as per the approved definition of done."
            />
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_submitted_corprus}
              onChange={(e) => this.checkField(e, "attest_submitted_corprus")}
              text="I attest that I have submitted the entire work corpus in the files linked above."
            />
          </div>
          <div className="c-form-row">
            <Checkbox
              value={attest_accept_crdao}
              onChange={(e) => this.checkField(e, "attest_accept_crdao")}
              text="I attest that I will accept the review of the CRdao or another associated work reviewer assigned by the ETA/DxD."
            />
          </div>

          <div id="milestone-vote-modal__buttons">
            <button
              type="submit"
              className="btn btn-success"
              disabled={this.isDisabledSubmit()}
            >
              Submit
            </button>
            <a className="btn btn-primary" onClick={this.hideModal}>
              Cancel
            </a>
          </div>
        </form>
        {submittingMilestones?.length && (
          <span className="multiple-selected-bottom">
            Milestone submission {submissionIndex + 1} of{" "}
            {submittingMilestones.length} selected
          </span>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(MilestoneVote);
