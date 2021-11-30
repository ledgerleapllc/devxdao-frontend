import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";

import "./welcome.scss";

class Welcome extends Component {
  render() {
    return (
      <div id="welcome-page">
        <div className="custom-container text-center">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <h1>Get Started</h1>
          </Fade>
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <p className="font-weight-500 font-size-18">
              Sign in if you already have an account or register if you’re a new
              user.
            </p>
          </Fade>
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <div>
              <div className="auth-actions">
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-white-outline">
                  Register
                </Link>
              </div>
              <div className="view-grant">
                <Link
                  to="/public-proposals"
                  className="w-100 mx-0 btn btn-white-outline"
                >
                  View grant pipeline first in our Public Viewer
                </Link>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    );
  }
}

export default Welcome;
