import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import { setActiveModal } from "../../../redux/actions";

import "./signup-welcome.scss";

const mapStateToProps = () => {
  return {};
};

class SignupWelcome extends Component {
  clickGuest = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("start-guest"));
  };

  render() {
    return (
      <div id="signup-welcome-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <h1>Registration</h1>
          </Fade>

          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <p className="text-center font-weight-500 font-size-18 mb-5">
              {`Thank you for your interest in the DEVxDAO. Please fill out the form
              to register and create an account.`}
            </p>
          </Fade>

          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <Link
              to="/register/form"
              id="begin-btn"
              className="btn btn-primary"
            >
              Begin Registration
            </Link>
          </Fade>

          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <p className="text-center font-size-12 mb-5">
              Already have an account?
              <br />
              <Link to="/login" className="link">
                Sign In
              </Link>
            </p>
          </Fade>

          {/*
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <p className="text-center font-size-12 mb-2">Just exploring?</p>
            <a
              className="btn btn-primary-outline mb-5"
              onClick={this.clickGuest}
            >
              Enter as Guest
            </a>
          </Fade>
          */}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(SignupWelcome);
