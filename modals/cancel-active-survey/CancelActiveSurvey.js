import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  forceReloadActiveSurveyTable,
  forceReloadGuardStartSurvey,
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { cancelSurvey } from "../../utils/Thunk";

import "./cancel-active-survey.scss";

const mapStateToProps = () => {
  return {};
};

class CancelActiveSurvey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  doCancelSurvey = () => {
    const { id } = this.props.data;
    this.props.dispatch(
      cancelSurvey(
        id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.hideModal();
          if (res.success) {
            this.props.dispatch(forceReloadActiveSurveyTable(true));
            this.props.dispatch(forceReloadGuardStartSurvey(true));
            this.props.dispatch(
              showAlert("Cancel Survey successfully!", "success")
            );
          }
        }
      )
    );
  };

  // Render Content
  render() {
    return (
      <div id="cancel-active-survey-modal">
        <p className="pb-4">
          {`This will end the survey early and all results will be abandoned. Are you sure?`}
        </p>
        <div className="actions">
          <button
            className="btn btn-primary small"
            onClick={this.doCancelSurvey}
          >
            Yes
          </button>
          <button
            className="btn btn-primary-outline small"
            onClick={this.hideModal}
          >
            No, take me back
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CancelActiveSurvey));
