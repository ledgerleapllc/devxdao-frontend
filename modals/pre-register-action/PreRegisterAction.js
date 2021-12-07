import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  setPreRegisterActionData,
  removeActiveModal,
  showCanvas,
  hideCanvas,
  setPreRegisterTableStatus,
} from "../../redux/actions";
import { approvePreRegister, denyPreRegister } from "../../utils/Thunk";

import "./pre-register-action.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    preRegisterActionData: state.modal.preRegisterActionData,
  };
};

class PreRegisterAction extends Component {
  hideModal = () => {
    this.props.dispatch(setPreRegisterActionData({}));
    this.props.dispatch(removeActiveModal());
  };

  clickInvite = (e) => {
    const { preRegisterActionData } = this.props;
    e.preventDefault();
    this.props.dispatch(
      approvePreRegister(
        preRegisterActionData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
          this.props.dispatch(setPreRegisterTableStatus(true));
          this.hideModal();
        }
      )
    );
  };

  clickDeny = (e) => {
    const { preRegisterActionData } = this.props;
    e.preventDefault();
    this.props.dispatch(
      denyPreRegister(
        preRegisterActionData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
          this.props.dispatch(setPreRegisterTableStatus(true));
          this.hideModal();
        }
      )
    );
  };

  renderButtons() {
    return (
      <div id="pre-register-action-modal__buttons">
        <a className="btn btn-success" onClick={this.clickInvite}>
          Invite to Portal
        </a>
        <a className="btn btn-danger" onClick={this.clickDeny}>
          Deny Access
        </a>
      </div>
    );
  }

  render() {
    const { authUser, preRegisterActionData } = this.props;
    if (
      !authUser ||
      !authUser.id ||
      !preRegisterActionData ||
      !preRegisterActionData.id
    )
      return null;

    return (
      <div id="pre-register-action-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2 className="mb-4">Pre-Register Data</h2>
        <p className="mb-1">
          First Name: <b>{preRegisterActionData.first_name}</b>
        </p>
        <p className="mb-1">
          Last Name: <b>{preRegisterActionData.last_name}</b>
        </p>
        <p className="mb-1">
          Email: <b>{preRegisterActionData.email}</b>
        </p>
        <p className="mb-1">
          Becoming a Voting Associate:{" "}
          <b>{preRegisterActionData.become_member ? "Yes" : "No"}</b>
        </p>
        <p className="mb-4">
          Obtaining a grant:{" "}
          <b>{preRegisterActionData.obtain_grant ? "Yes" : "No"}</b>
        </p>
        <div className="mb-4">
          <label className="d-block mb-1">Qualifications:</label>
          {preRegisterActionData.qualifications ? (
            <p className="font-weight-700">
              {preRegisterActionData.qualifications}
            </p>
          ) : null}
        </div>
        <div className="mb-4">
          <label className="d-block mb-1">Technology:</label>
          {preRegisterActionData.technology ? (
            <p className="font-weight-700">
              {preRegisterActionData.technology}
            </p>
          ) : null}
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PreRegisterAction);
