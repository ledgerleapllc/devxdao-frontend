import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./surveys.scss";
import ActiveSurveyTab from "./components/tabs/active-survey-tab";
import WinnersTab from "./components/tabs/winners-tab";
import DownvotedTab from "./components/tabs/downvoted-tab";
import RFPSurveysTab from "./components/tabs/rfp-surveys-tab";
import CompletedSurveyTab from "./components/tabs/completed-survey-tab";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Surveys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "active",
    };
  }

  render() {
    const { tab } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-survey-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <ul id="app-discussions-pageHeader">
            <li
              className={tab == "active" ? "active" : ""}
              onClick={() => this.setState({ tab: "active" })}
            >
              Active
            </li>
            <li
              className={tab == "completed" ? "active" : ""}
              onClick={() => this.setState({ tab: "completed" })}
            >
              Completed
            </li>
            <li
              className={tab == "winners" ? "active" : ""}
              onClick={() => this.setState({ tab: "winners" })}
            >
              Winners
            </li>
            <li
              className={tab == "downvoted" ? "active" : ""}
              onClick={() => this.setState({ tab: "downvoted" })}
            >
              Downvoted
            </li>
            <li
              className={tab == "rfp-surveys" ? "active" : ""}
              onClick={() => this.setState({ tab: "rfp-surveys" })}
            >
              RFP Surveys
            </li>
          </ul>
        </Fade>
        {tab === "active" && <ActiveSurveyTab />}
        {tab === "completed" && <CompletedSurveyTab />}
        {tab === "winners" && <WinnersTab />}
        {tab === "downvoted" && <DownvotedTab />}
        {tab === "rfp-surveys" && <RFPSurveysTab />}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Surveys));
