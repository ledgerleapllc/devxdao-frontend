/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  saveUser,
  removeActiveModal,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { completeStepReview2, sendHellosignRequest } from "../../utils/Thunk";

import "./start-hellosign.scss";

const mapStateToProps = () => {
  return {};
};

class StartHellosign extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.client = null;
    this.signature_request_id = null;
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    const HelloSign = require("hellosign-embedded");

    this.client = new HelloSign();
    this.client.on("sign", () => {
      // data: signatureId
      this.client.close();
      const params = {
        signature_request_id: this.signature_request_id,
      };
      this.props.dispatch(
        completeStepReview2(
          params,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res && res.success) this.hideModal();
          }
        )
      );
    });
  }

  // Hide Modal
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  // Click Start
  clickStart = (e) => {
    e.preventDefault();
    this.props.dispatch(
      sendHellosignRequest(
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.url) {
            this.signature_request_id = res.signature_request_id;
            if (this.client) {
              this.client.open(res.url, {
                clientId: process.env.NEXT_PUBLIC_HELLOSIGN_CLIENT_ID,
                skipDomainVerification: true,
              });
            }
          }
        }
      )
    );
  };

  // Click Logout
  clickLogout = (e) => {
    e.preventDefault();
    this.hideModal();
    Helper.removeUser();
    this.props.dispatch(saveUser({}));
  };

  // Render Content
  render() {
    return (
      <div id="start-hellosign-modal">
        <h2>Welcome to the DEVxDAO</h2>
        <p className="mt-2 mb-3">{`Before you proceed, you must sign the following agreement detailing the terms of your engagement with this portal. We would like to draw your attention to the fact that within the DEVxDAO environment certain rules are applicable amongst the various parties. This enables us to improve your future experience.`}</p>
        <p className="mb-5">
          Please sign the Program Associate Agreement with the{" "}
          <b>Emerging Technology Association</b> and carefully read all the
          policies, including those within the next document.
        </p>

        <div id="start-hellosign-modal__buttons">
          <a className="btn btn-primary" onClick={this.clickStart}>
            Sign Agreement
          </a>
          <a className="btn btn-danger" onClick={this.clickLogout}>
            Sign Out
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StartHellosign);
