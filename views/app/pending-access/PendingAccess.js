import React, { Component } from "react";
import { connect } from "react-redux";
import { saveUser } from "../../../redux/actions";
import Helper from "../../../utils/Helper";

import "./pending-access.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class PendingAccess extends Component {
  logout = (e) => {
    e.preventDefault();
    Helper.removeUser();
    this.props.dispatch(saveUser({}));
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="pending-access-page">
        <div className="custom-container">
          <div>
            <h1>Your account is pending</h1>
            <p>{`This portal provides access to forum discussions and the ability to apply for grants and membership. You must sign two agreements with the Emerging Technology Association prior to accessing this portal.`}</p>
            <p>{`Please watch your email, these forms will be sent with 24 to 48 hours. Once you have signed these forms, the portal admins with grant access to your account.`}</p>
            <a className="btn btn-primary" onClick={this.logout}>
              Sign Out
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PendingAccess);
