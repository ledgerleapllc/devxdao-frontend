import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { withRouter, Redirect } from "react-router-dom";
import { showSidebar, hideSidebar } from "../../redux/actions";
import { DashboardRoutes } from "../../routes";
import SidebarLayout from "../sidebar/Sidebar";

import "./dashboard.scss";

const mapStateToProps = (state) => {
  return {
    sidebarShown: state.global.sidebarShown,
  };
};

class Dashboard extends Component {
  componentDidMount() {
    document.body.onclick = (e) => {
      const { sidebarShown } = this.props;

      const target = e.target || null;

      if (target && target.id == "dashboard-canvas" && sidebarShown) {
        this.props.dispatch(hideSidebar());
      }
    };
  }

  showSidebar = (e) => {
    e.preventDefault();
    this.props.dispatch(showSidebar());
  };

  render() {
    const { auth: authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    if (!authUser.is_admin) {
      return (
        <Redirect
          to={{
            pathname: "/",
          }}
        />
      );
    }

    return (
      <div className="dashboard-page-wrap">
        <SidebarLayout />

        <div className="dashboard-content-wrap">
          <div id="dashboard-canvas"></div>

          <div className="dashboard-content">
            <div id="dashboard-content__header">
              <Icon.Menu onClick={this.showSidebar} />

              <span>
                <Icon.User color="#180431" size={14} />
              </span>
              <p className="font-weight-500">
                Signed in as: <span>ADMIN</span>
              </p>
            </div>

            <DashboardRoutes />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Dashboard));
