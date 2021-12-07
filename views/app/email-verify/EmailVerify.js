/* eslint-disable react/no-unescaped-entities */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { showAlert, showCanvas, hideCanvas } from "../../../redux/actions";
import { getMe, resendCode, verifyCode } from "../../../utils/Thunk";

import "./email-verify.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class EmailVerify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
    };
  }

  inputCode = (e) => {
    this.setState({ code: e.target.value });
  };

  clickResend = (e) => {
    e.preventDefault();

    this.props.dispatch(
      resendCode(
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  submit = (e) => {
    e.preventDefault();

    const { code } = this.state;

    if (!code) {
      this.props.dispatch(showAlert("Input verification code"));
      return;
    }

    this.props.dispatch(
      verifyCode(
        code,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            this.props.dispatch(
              getMe(
                () => {},
                () => {
                  this.props.dispatch(hideCanvas());
                }
              )
            );
          } else this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    const { code } = this.state;

    if (!authUser || !authUser.id) return null;

    return (
      <div id="email-verify-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <form action="" method="POST" onSubmit={this.submit}>
              <h1 className="text-center">Email Verification</h1>
              <p className="font-size-18 text-center">
                Please enter the code sent to the email: {authUser.email}
              </p>
              <p className="font-size-14 text-center mt-4">
                {`Make sure to check your spam folder if you do not see the code in your box after 1 minute.`}
              </p>
              <p
                className="font-size-14 text-center"
                style={{ marginTop: "5px" }}
              >
                If you still don't see it in spam, you can{" "}
                <a onClick={this.clickResend}>resend the code</a>
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

export default connect(mapStateToProps)(EmailVerify);
