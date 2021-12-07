import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./style.scss";
import ActiveRFPSurveysTable from "../../tables/active-rfp-surveys";
import CompletedRFPSurveysTable from "../../tables/completed-rfp-surveys";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class RFPSurveysTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="h-100 rfp-survey-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="active-rfp-surveys-section app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Active Surveys</label>
            </div>
            <ActiveRFPSurveysTable />
          </section>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="completed-rfp-surveys-section app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Completed Surveys</label>
            </div>
            <CompletedRFPSurveysTable />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(RFPSurveysTab));
