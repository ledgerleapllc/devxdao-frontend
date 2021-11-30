import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  saveUser,
  removeActiveModal,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { startGuest } from "../../utils/Thunk";

import "./start-guest.scss";

const mapStateToProps = () => {
  return {};
};

class StartGuest extends Component {
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  clickEnter = (e) => {
    e.preventDefault();
    // Start As Guest
    const guestKey = Helper.getGuestKey();
    const params = {
      guest_key: guestKey,
    };

    this.props.dispatch(
      startGuest(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success && res.user) {
            this.hideModal();
            const authUser = res.user;
            Helper.storeUser(authUser);
            this.props.dispatch(saveUser(authUser));
          }
        }
      )
    );
  };

  render() {
    return (
      <div id="start-guest-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2>Start as Guest</h2>
        <p className="mt-2 mb-5">{`Guests are welcome to explore the portal. As a guest, you can view discussions, completed votes, and proposals in the portal. If you would like to engage further, you will need to register an account. As a guest you must agree to the terms and conditions to proceed.`}</p>

        <div id="start-guest-modal__buttons">
          <a className="btn btn-primary" onClick={this.clickEnter}>
            Enter Portal
          </a>
          <a className="btn btn-danger" onClick={this.hideModal}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StartGuest);
