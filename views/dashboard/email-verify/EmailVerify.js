import React, { Component } from "react";
import { connect } from "react-redux";
import { showAlert, showCanvas, hideCanvas } from "../../../redux/actions";
import { getMe, verifyCode } from "../../../utils/Thunk";

import "./email-verify.scss";

const mapStateToProps = () => {
  return {};
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
    const { code } = this.state;

    return (
      <div id="email-verify-page">
        <div className="custom-container">
          <form action="" method="POST" onSubmit={this.submit}>
            <h1 className="text-center">Email Verification</h1>
            <p className="font-size-18 text-center">
              Please enter the code sent to the email: imatestuser1@yahoo.com
            </p>
            <input
              placeholder="*****"
              type="text"
              value={code}
              onChange={this.inputCode}
            />
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(EmailVerify);
