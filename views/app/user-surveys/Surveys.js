import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./surveys.scss";
import ActiveUserSurveyTab from "./components/tabs/active-user-survey-tab";
import CompletedUserSurveyTab from "./components/tabs/completed-user-survey-tab";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class UserSurveys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "active",
    };
  }

  render() {
    const { tab } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id || !authUser.is_member) return null;

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
          </ul>
        </Fade>
        {tab === "active" && <ActiveUserSurveyTab />}
        {tab === "completed" && <CompletedUserSurveyTab />}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(UserSurveys));
