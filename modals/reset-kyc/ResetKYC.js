/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  hideCanvas,
  removeActiveModal,
  setKYCData,
  setRefreshSingleUserPage,
  showCanvas,
} from "../../redux/actions";
import { resetKYC } from "../../utils/Thunk";
import "./reset-kyc.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    kycData: state.modal.kycData,
  };
};

class ResetKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetMessage: "",
    };
  }

  hideModal = () => {
    this.props.dispatch(setKYCData({}));
    this.props.dispatch(removeActiveModal());
  };

  doReset = (e) => {
    e.preventDefault();
    const { kycData: user } = this.props;
    const { resetMessage } = this.state;
    if (!resetMessage || !resetMessage.trim()) return;
    if (!confirm("Are you sure you are going to reset this KYC?")) return;
    const params = {
      message: resetMessage,
    };
    this.props.dispatch(
      resetKYC(
        user.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  };

  render() {
    const { authUser, kycData: user } = this.props;
    const { resetMessage } = this.state;
    if (!authUser || !authUser.id || !user || !user.id) return null;

    return (
      <div id="reset-kyc-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2 className="mb-4">KYC Reset</h2>

        <p className="font-size-14">{`Please add any notes, these will be emailed to the user and they will be prompted to submit again.`}</p>
        <textarea
          value={resetMessage}
          onChange={(e) => this.setState({ resetMessage: e.target.value })}
          placeholder={`Admin - add your notes here letting the user know what to do to avoid the problem.`}
        ></textarea>

        <div id="reset-kyc-modal__buttons">
          <a className="btn btn-primary btn-fluid" onClick={this.doReset}>
            Reset and Email User
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ResetKYC);
