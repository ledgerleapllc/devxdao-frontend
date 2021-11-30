/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  setKYCData,
  removeActiveModal,
  showCanvas,
  hideCanvas,
  setOnboardingTableStatus,
} from "../../redux/actions";
import { approveKYC, denyKYC, resetKYC } from "../../utils/Thunk";

import "./review-kyc.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    kycData: state.modal.kycData,
  };
};

class ReviewKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showReset: false,
      resetMessage: "",
    };
  }

  hideModal = () => {
    this.props.dispatch(setKYCData({}));
    this.props.dispatch(removeActiveModal());
  };

  approve = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to approve this KYC?")) return;
    const { kycData: user } = this.props;
    this.props.dispatch(
      approveKYC(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setOnboardingTableStatus(true));
          }
        }
      )
    );
  };

  deny = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to deny this KYC?")) return;
    const { kycData: user } = this.props;
    this.props.dispatch(
      denyKYC(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setOnboardingTableStatus(true));
          }
        }
      )
    );
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
            this.props.dispatch(setOnboardingTableStatus(true));
          }
        }
      )
    );
  };

  reset = (e) => {
    e.preventDefault();
    this.setState({ showReset: true });
  };

  renderTitle() {
    const { kycData: user } = this.props;
    if (user.shuftipro && user.shuftipro.id) {
      if (user.shuftipro.status == "approved" || user.shuftipro.reviewed)
        return "View KYC";
      return "Review KYC";
    }
    return null;
  }

  // Render Shuftipro
  renderShuftipro() {
    const { kycData: user } = this.props;
    const { shuftipro } = user;
    if (!shuftipro || !shuftipro.id) return null;

    if (shuftipro.status == "approved") {
      return (
        <p className="font-size-14 mb-1">
          KYC Status: <b className="color-success">Approved</b>
        </p>
      );
    } else if (shuftipro.status == "denied") {
      if (user.shuftipro_data && user.shuftipro_data.declined_reason) {
        return (
          <Fragment>
            <p className="font-size-14 mb-1">
              KYC Status: <b className="color-danger">Denied</b>
            </p>
            <p className="font-size-14 mb-1">
              Declined Reason: <b>{user.shuftipro_data.declined_reason}</b>
            </p>
          </Fragment>
        );
      } else {
        return (
          <p className="font-size-14 mb-1">
            KYC Status: <b className="color-danger">Denied</b>
          </p>
        );
      }
    }
    return null;
  }

  // Render Buttons
  renderButtons() {
    const { kycData: user } = this.props;
    if (!user.shuftipro || !user.shuftipro.id) return null;
    if (user.shuftipro.status == "approved" || user.shuftipro.reviewed)
      return null;

    return (
      <Fragment>
        <div id="review-kyc-modal__buttons">
          <a
            className="btn btn-success btn-fluid less-small"
            onClick={this.approve}
          >
            Approve
          </a>
          <a
            className="btn btn-danger btn-fluid less-small"
            onClick={this.deny}
          >
            Deny
            <label className="font-size-14 d-block">
              (warning: this is final)
            </label>
          </a>
          <a
            className="btn btn-primary btn-fluid less-small"
            onClick={this.reset}
          >
            Reset
            <label className="font-size-14 d-block">(user submits again)</label>
          </a>
        </div>
      </Fragment>
    );
  }

  render() {
    const { authUser, kycData: user } = this.props;
    const { showReset, resetMessage } = this.state;
    if (!authUser || !authUser.id || !user || !user.id) return null;

    if (showReset) {
      return (
        <div id="review-kyc-modal">
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

          <div id="review-kyc-modal__buttons_2">
            <a
              className="btn btn-primary btn-fluid less-small"
              onClick={() => this.setState({ showReset: false })}
            >
              Go Back
            </a>
            <a
              className="btn btn-success btn-fluid less-small"
              onClick={this.doReset}
            >
              Reset and Email User
            </a>
          </div>
        </div>
      );
    }

    return (
      <div id="review-kyc-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2 className="mb-4">{this.renderTitle()}</h2>
        <a
          target="_blank"
          rel="noreferrer"
          className="font-size-14 text-underline"
          style={{ color: "black" }}
          href={`/app/user/${user.id}`}
        >
          View user detail page
        </a>
        <p className="font-size-14 mt-2 mb-1">First Name: {user.first_name}</p>
        <p className="font-size-14 mb-1">Last Name: {user.last_name}</p>
        <p className="font-size-14 mb-1">Date of Birth: {user.profile?.dob}</p>
        <p className="font-size-14 mb-1">
          Country of Citizenship: {user.profile?.country_citizenship}
        </p>
        <p className="font-size-14 mb-1">
          Address Line 1: {user.profile?.address}
        </p>
        <p className="font-size-14 mb-1">
          Address Line 2: {user.profile?.address_2}
        </p>
        <p className="font-size-14 mb-1">Town / City: {user.profile?.city}</p>
        <p className="font-size-14 mb-1">Postal Code: {user.profile?.zip}</p>
        <p className="font-size-14 mb-1">
          Country of Residence: {user.profile.country_residence}
        </p>
        {this.renderShuftipro()}
        {user.shuftipro && (
          <p className="font-size-14 mb-1">
            Shufti Ref #: {user.shuftipro.reference_id}
          </p>
        )}
        {this.renderButtons()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(ReviewKYC);
