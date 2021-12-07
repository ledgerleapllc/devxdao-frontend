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
import { undoRevokeAdmin } from "../../utils/Thunk";

import "./ask-undo-revoke-admin.scss";

const mapStateToProps = () => {
  return {};
};

class AskUndoRevokeAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  undo = () => {
    const { id } = this.props.data;
    this.props.dispatch(
      undoRevokeAdmin(
        { id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.hideModal();
          if (res.success) {
            this.props.dispatch(forceReloadAdminTeam(true));
            this.props.dispatch(
              showAlert("Undo Revoke successfully!", "success")
            );
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
          Are you sure you want to undo revoke admin privileges from{" "}
          {this.props.data.email} ?
        </p>
        <div className="actions">
          <button className="btn btn-primary small" onClick={this.undo}>
            Undo
          </button>
          <button className="btn btn-danger small" onClick={this.hideModal}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AskUndoRevokeAdmin));
