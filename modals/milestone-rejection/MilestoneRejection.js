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
import "./milestone-rejection.scss";

const mapStateToProps = () => {
  return {};
};

class MilestoneRejection extends Component {
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
      <div id="milestone-rejection-modal">
        <h4 className="pb-2">
          You are Denying this milestone. Please write the reason below. This
          will be emailed to the user.
        </h4>
        <textarea
          placeholder={`Write reason here`}
          value={this.state.message}
          onChange={(e) => this.setState({ message: e.target.value })}
          rows="7"
        ></textarea>
        <div className="text-right">
          <button
            className={`btn btn-primary-outline mr-3`}
            onClick={this.hideModal}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={this.doDeny}>
            Deny and email user
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(MilestoneRejection));
