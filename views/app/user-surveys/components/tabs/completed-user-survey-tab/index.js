import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import CompletedSurveysTable from "../../tables/completed-surveys";
import CompletedRFPSurveysTable from "../../tables/completed-rfp-surveys";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class CompletedUserSurveyTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="survey-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="h-50 active-section app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Grant</label>
            </div>
            <CompletedSurveysTable />
          </section>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="h-50 app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>RFP Surveys</label>
            </div>
            <CompletedRFPSurveysTable />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CompletedUserSurveyTab));
