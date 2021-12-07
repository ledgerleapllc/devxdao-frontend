import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import EmailVerifyView from "./email-verify/EmailVerify";
import PendingAccessView from "./pending-access/PendingAccess";
import Login2FAView from "./login-2fa/Login2FA";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Auth extends Component {
  render() {
    const { authUser } = this.props;

    if (!authUser || !authUser.id || !authUser.profile || !authUser.profile.id)
      return null;

    // Email Verify ( Guest Bypasses )
    if (!authUser.is_admin) {
      if (!authUser.email_verified && !authUser.is_guest)
        return <EmailVerifyView />;
      else if (!authUser.can_access) return <PendingAccessView />;
    }

    // Login Two FA Check
    if (authUser.profile.twoFA_login && authUser.profile.twoFA_login_active)
      return <Login2FAView />;
    return <Redirect to="/app" />;
  }
}

export default connect(mapStateToProps)(withRouter(Auth));
