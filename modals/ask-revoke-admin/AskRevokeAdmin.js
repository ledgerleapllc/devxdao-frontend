import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import {
  forceReloadAdminTeam,
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { revokeAdmin } from "../../utils/Thunk";

import "./ask-revoke-admin.scss";

const mapStateToProps = () => {
  return {};
};

class AskRevokeAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  revokeAdmin = () => {
    const { id } = this.props.data;
    this.props.dispatch(
      revokeAdmin(
        { id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.hideModal();
          if (res.success) {
            this.props.dispatch(forceReloadAdminTeam(true));
            this.props.dispatch(showAlert("Revoked successfully!", "success"));
          }
        }
      )
    );
  };

  // Render Content
  render() {
    return (
      <div id="ask-revoke-admin-modal">
        <p className="pb-4">
          Are you sure you want to revoke admin privileges from{" "}
          {this.props.data.email} ?
        </p>
        <div className="actions">
          <button className="btn btn-primary small" onClick={this.revokeAdmin}>
            Revoke
          </button>
          <button className="btn btn-danger small" onClick={this.hideModal}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AskRevokeAdmin));
