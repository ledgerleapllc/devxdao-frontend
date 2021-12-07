import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Checkbox } from "../../components";

import {
  removeActiveModal,
  setActiveModal,
  setMilestoneVoteData,
} from "../../redux/actions";

import "./style.scss";

const mapStateToProps = () => {
  return {};
};

class MultipleMilestoneSubmit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      milestones: [],
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  getMilestoneInfo = (item) => {
    const milestones = item.proposal.milestones;
    const index = item.milestones_submitted;
    if (!milestones[index]) return;

    return {
      index,
      proposal: item.proposal,
      milestone: milestones[index],
    };
  };

  singleReview = async () => {
    const { data } = this.props;
    const item = data.item;
    const milestones = item.proposal.milestones;
    const index = item.milestones_submitted;
    if (!milestones[index]) return;

    const milestone = {
      index,
      proposal: item.proposal,
      milestone: milestones[index],
    };
    this.hideModal();
    await this.props.dispatch(setMilestoneVoteData(milestone));
    await this.props.dispatch(setActiveModal("milestone-vote"));
  };

  multipleReview = () => {
    this.setState({ step: 1 });
  };

  multipleSubmit = async () => {
    const { milestones } = this.state;
    const { data } = this.props;
    const item = data.item;
    const submittingMilestones = milestones.map((x) => {
      const index = item.proposal.milestones.findIndex((y) => +y.id === +x);
      return {
        index,
        proposal: item.proposal,
        milestone: item.proposal.milestones[index],
      };
    });
    this.hideModal();
    await this.props.dispatch(setMilestoneVoteData(submittingMilestones[0]));
    await this.props.dispatch(
      setActiveModal("milestone-vote", { submittingMilestones })
    );
  };

  back = () => {
    this.setState({ step: 0 });
  };

  toggle = (value, key) => {
    let { milestones } = this.state;
    if (value) {
      milestones.push(key);
    } else {
      milestones = milestones.filter((x) => x !== key);
    }
    this.setState({ milestones });
  };

  // Render Content
  render() {
    const { step, milestones } = this.state;
    const { data } = this.props;
    return (
      <div id="multiple-milestone-review-modal">
        {step === 0 && (
          <>
            <h4 className="pb-1">
              Your grant has {data?.unsubmittedMilestones.length} Milestones
              remaining.
              <br />
              Please select whether you are submitting one or more milestones as
              complete.
            </h4>
            <div className="actions">
              <button className="btn btn-primary" onClick={this.singleReview}>
                {`Only the next milestone is complete and ready to submit for review.`}
              </button>
              <button className="btn btn-primary" onClick={this.multipleReview}>
                {`I have more than one new milestone complete and ready to sumbit for review.`}
              </button>
              <a onClick={this.hideModal} style={{ cursor: "pointer" }}>
                Close
              </a>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h4 className="pb-1">
              Please select which the milestones you would like to submit today.
            </h4>
            <ul>
              {data?.unsubmittedMilestones.map((mile, index) => (
                <li className="text-left" key={index}>
                  <Checkbox
                    onChange={(e) => this.toggle(e, mile.id)}
                    text={`Milestone ${mile.milestone_posittion} - ${mile.title}`}
                  />
                </li>
              ))}
            </ul>
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={this.multipleSubmit}
                disabled={!milestones.length}
              >
                Submit
              </button>
              <a onClick={this.hideModal} style={{ cursor: "pointer" }}>
                Cancel
              </a>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(MultipleMilestoneSubmit));
