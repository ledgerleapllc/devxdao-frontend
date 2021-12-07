import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { denyReviewMilestone } from "../../utils/Thunk";
import "./start-milestone.scss";

const mapStateToProps = () => {
  return {};
};

class StartMilestone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  doDeny = () => {
    const { milestoneId } = this.props.data;
    this.props.dispatch(
      denyReviewMilestone(
        { milestoneId, message: this.state.message },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert("You've successfully denied this milestone", "success")
            );
            this.hideModal();
            const { history } = this.props;
            history.push("/app/milestones");
          }
        }
      )
    );
  };

  render() {
    return (
      <div id="milestone-rejection-modal" className="text-center">
        <h3 className="pb-4">Thank you!</h3>
        <p>
          Your submission will be reviewed by the code review team. You will
          receive a message letting you know if the submission is accepted and
          moving to vote, or if changes are needed.
        </p>
        <div className="mt-4">
          <button className={`btn btn-primary`} onClick={this.hideModal}>
            Continue
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(StartMilestone));
