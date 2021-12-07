import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import MoveToFormalView from "../shared/move-to-formal/MoveToFormal";
import PendingGrantsView from "../shared/pending-grants/PendingGrants";

import "./onboardings.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Onboardings extends Component {
  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id || !authUser.is_admin) return null;

    return (
      <div id="app-onboardings-page">
        <MoveToFormalView />
        <PendingGrantsView />
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Onboardings));
