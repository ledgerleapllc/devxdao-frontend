import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { withRouter, Redirect } from "react-router-dom";
import SidebarLayout from "../sidebar/Sidebar";
import { showSidebar, hideSidebar, setActiveModal } from "../../redux/actions";
import { AuthAppRoutes } from "../../routes";
import { BRAND } from "../../utils/Constant";

import "./authapp.scss";

const mapStateToProps = (state) => {
  return {
    sidebarShown: state.global.sidebarShown,
  };
};

class AuthApp extends Component {
  componentDidMount() {
    document.body.onclick = (e) => {
      const { sidebarShown } = this.props;

      const target = e.target || null;

      if (target && target.id == "app-canvas" && sidebarShown)
        this.props.dispatch(hideSidebar());
    };
  }

  showSidebar = (e) => {
    e.preventDefault();
    this.props.dispatch(showSidebar());
  };

  startKYC = () => {
    this.props.dispatch(setActiveModal("start-kyc"));
  };

  kycError = () => {
    this.props.dispatch(setActiveModal("kyc-error"));
  };

  render() {
    const { auth: authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (
      !authUser.is_admin &&
      !authUser.is_participant &&
      !authUser.is_member &&
      !authUser.is_proposer &&
      !authUser.is_guest
    )
      return <Redirect to="/" />;

    if (!authUser.is_admin) {
      if (!authUser.email_verified || !authUser.can_access)
        return <Redirect to="/" />;
    }

    if (
      authUser.profile &&
      authUser.profile.twoFA_login &&
      authUser.profile.twoFA_login_active
    )
      return <Redirect to="/" />;

    return (
      <div className="app-page-wrap">
        <SidebarLayout authUser={authUser} />

        <div className="app-content-wrap">
          <div id="app-canvas"></div>

          <div className="app-content-body" id="app-content-body">
            <div id="app-content__header">
              <Icon.Menu onClick={this.showSidebar} />
            </div>

            <AuthAppRoutes />
          </div>
          <div id="app-content__footer">&copy;{BRAND} 2021</div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AuthApp));
