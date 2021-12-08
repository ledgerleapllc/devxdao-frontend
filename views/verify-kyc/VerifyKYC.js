import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { hideCanvas, saveUser, showCanvas } from "../../redux/actions";
import { completeStepKYC } from "../../utils/Thunk";

import "./verify-kyc.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class VerifyKYC extends Component {
  verify = (e) => {
    const { authUser, history } = this.props;
    e.preventDefault();

    if (!authUser || !authUser.id) return;

    this.props.dispatch(
      completeStepKYC(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());

          if (res.success) {
            let authUserNew = authUser;
            authUserNew.profile = {
              ...authUser.profile,
              step_kyc: 1,
            };
            this.props.dispatch(saveUser(authUserNew));
          }

          history.push("/");
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    if (authUser.is_admin || authUser.profile.step_kyc)
      return <Redirect to="/" />;

    return (
      <div id="verify-kyc-page">
        <div className="custom-container">
          <h1>KYC Verification</h1>
          <p className="mt-3 font-size-18 font-weight-500">
            You must now submit your KYC details to access all features in the
            portal. You will need to upload:
          </p>

          <ul>
            <li>
              <img src="/kyc-1.png" alt="" />
              <label className="font-size-18 font-weight-500">
                ID or Passport for identity verification
              </label>
            </li>
            <li>
              <img src="/kyc-2.png" alt="" />
              <label className="font-size-18 font-weight-500">
                A bank statement or utility bill for address verification
              </label>
            </li>
          </ul>

          <p className="font-size-18 font-weight-500 mb-3">
            Please click the button below when you have these documents ready.
          </p>

          <a className="btn btn-primary" onClick={this.verify}>
            Begin KYC
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(VerifyKYC));
