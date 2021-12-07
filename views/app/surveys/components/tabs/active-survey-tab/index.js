import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import ActiveSurveysTable from "../../tables/active-surveys";
import DiscussionProposalsTable from "../../tables/discussion-proposals";
import "./style.scss";
import { getSurveys } from "../../../../../../utils/Thunk";
import {
  forceReloadGuardStartSurvey,
  showAlert,
} from "../../../../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadGuardStartSurvey: state.admin.reloadGuardStartSurvey,
  };
};

class ActiveSurveyTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActiveSurveyExisted: null,
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.reloadGuardStartSurvey &&
      this.props.reloadGuardStartSurvey !== prevProps.reloadGuardStartSurvey
    ) {
      this.props.dispatch(forceReloadGuardStartSurvey(false));
      this.getData();
    }
  }

  getData() {
    const params = {
      limit: 1,
      status: "active",
    };

    this.props.dispatch(
      getSurveys(
        params,
        () => {},
        (res) => {
          const result = res.surveys || [];
          this.setState({
            isActiveSurveyExisted: result.length > 0,
          });
        }
      )
    );
  }

  startNewSurvey = () => {
    const { isActiveSurveyExisted } = this.state;
    if (isActiveSurveyExisted) {
      this.props.dispatch(
        showAlert(
          "You cannot begin a new survey while a survey is active.",
          "warning"
        )
      );
    }
    if (isActiveSurveyExisted === false) {
      const { history } = this.props;
      history.push("/app/surveys/start");
    }
  };

  render() {
    return (
      <div className="survey-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="active-section app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Active Surveys</label>
              <button
                onClick={this.startNewSurvey}
                className="btn btn-primary less-small"
              >
                Start New Survey
              </button>
            </div>
            <ActiveSurveysTable />
          </section>
          <section className="discussion-table app-infinite-box mb-4">
            <DiscussionProposalsTable />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ActiveSurveyTab));
