import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class NewSurveyAlert extends Component {
  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (authUser.is_member && authUser.has_survey) {
      return (
        <Fade distance={"20px"} right duration={200} delay={500}>
          <div id="app-newgrant-box" className="new-member">
            <div>
              <label className="font-weight-700">
                A survey is active! Please respond to your survey in the survey{" "}
                tab in the left menu.
              </label>
            </div>
          </div>
        </Fade>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps)(withRouter(NewSurveyAlert));
