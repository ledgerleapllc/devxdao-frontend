import React, { Component } from "react";
import { connect } from "react-redux";
import {
  removeActiveModal,
  showCanvas,
  hideCanvas,
  setActiveModal,
} from "../../redux/actions";
import { getMe, sendKycKangaroo, dismissStartKyc } from "../../utils/Thunk";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class StartKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Hide Modal
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  // Click Start
  sendLink = (e) => {
    e.preventDefault();
    this.props.dispatch(
      sendKycKangaroo(
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (
            !res.sucess &&
            res.message?.startsWith("We have located an existing KYC record")
          ) {
            this.props.dispatch(
              getMe(
                () => {},
                () => {}
              )
            );
            this.hideModal();
          }
          if (res.success) {
            this.props.dispatch(setActiveModal("confirm-kyc-link"));
            this.props.dispatch(
              getMe(
                () => {},
                () => {}
              )
            );
          }
        }
      )
    );
  };

  skip = () => {
    this.props.dispatch(
      dismissStartKyc(
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.hideModal();
          }
        }
      )
    );
  };

  // Render Content
  render() {
    return (
      <div id="start-kyc-modal">
        <h2 className="pb-2">Welcome to the Grant Portal</h2>
        <p className="mt-2 mb-3">
          {`Before submitting your first Grant request you will need to start the KYC process. Please click the link below to get a KYC/AML submission link sent to your inbox at ${this.props.authUser.email}.`}
        </p>
        <p className="mt-2 mb-3">
          {`We highly recommend starting this process right away because KYC can take a few days to complete and you will not be able to request a grant until it is submitted.`}
        </p>
        <div id="start-kyc-modal__buttons" className="pt-2">
          <button className="btn btn-primary" onClick={this.sendLink}>
            Send me a link to start the KYC/AML process
          </button>
          <a
            className="color-primary text-underline"
            onClick={() => this.skip()}
            style={{ cursor: "pointer" }}
          >
            Skip for now (not recommended)
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StartKYC);
