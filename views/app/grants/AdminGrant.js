import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import AdminPendingGrant from "./AdminPendingGrant";
import AdminActiveGrant from "./AdminActiveGrant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class AdminGrant extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <>
        <div className="pb-3 h-50">
          <AdminPendingGrant />
        </div>
        <div className="pt-3 h-50">
          <AdminActiveGrant />
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AdminGrant));
