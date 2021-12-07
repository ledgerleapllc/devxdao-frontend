import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";

import {
  forceReloadAdminTeam,
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { inviteAdmin } from "../../utils/Thunk";

import "./add-admin-box.scss";

const mapStateToProps = () => {
  return {};
};

class AddAdminBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  doInviteAdmin = () => {
    const { email } = this.state;
    this.props.dispatch(
      inviteAdmin(
        { email },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(forceReloadAdminTeam(true));
            this.props.dispatch(showAlert("Invited successfully!", "success"));
            this.hideModal();
          }
        }
      )
    );
  };

  // Render Content
  render() {
    return (
      <div id="add-admin-box-modal">
        <p className="pb-4">
          Enter the email address of the person you would like too invite to be
          come an admin
        </p>
        <FormInputComponent
          value={this.state.email}
          onChange={(e) => this.setState({ email: e.target.value })}
          placeholder="Email"
          required={true}
        />
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={this.doInviteAdmin}
            disabled={!this.state.email}
          >
            Invite
          </button>
          <button className="btn btn-danger" onClick={this.hideModal}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AddAdminBox));
