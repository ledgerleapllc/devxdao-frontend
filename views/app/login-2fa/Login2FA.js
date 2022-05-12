/* eslint-disable react/no-unescaped-entities */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";
import { checkLogin2FA } from "../../../utils/Thunk";

import "./login-2fa.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Login2FA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
    };
  }

  inputCode = (e) => {
    this.setState({ code: e.target.value });
  };

  submit = (e) => {
    e.preventDefault();

    const { code } = this.state;

    if (!code) {
      this.props.dispatch(showAlert("Input two-factor authentication code"));
      return;
    }

    this.props.dispatch(
      checkLogin2FA(
        code,
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    const { code } = this.state;

    if (!authUser || !authUser.id) return null;

    return (
      <div id="login-2fa-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <form action="" method="POST" onSubmit={this.submit}>
              <h1 className="text-center">Two-Factor Authentication</h1>
              <p className="font-size-18 text-center">
                Please enter the code sent to the email: {authUser.email}
              </p>
              <p className="font-size-14 text-center mt-4">
                {`Make sure to check your spam folder if you do not see the code in your box after 1 minute.`}
              </p>
              <input
                placeholder="Enter Code"
                type="text"
                value={code}
                onChange={this.inputCode}
              />
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </Fade>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Login2FA);
