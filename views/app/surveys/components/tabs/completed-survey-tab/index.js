import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import CompletedSurveysTable from "../../tables/completed-surveys";

import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class CompletedSurveyTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="h-100 milestones-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="h-100 app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Completed Surveys</label>
            </div>
            <CompletedSurveysTable />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CompletedSurveyTab));
