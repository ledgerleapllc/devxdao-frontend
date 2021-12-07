import React, { Component } from "react";
import { connect } from "react-redux";
import { removeActiveModal } from "../../redux/actions";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ConfirmKYCLink extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Hide Modal
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  // Render Content
  render() {
    const user = this.props.authUser;
    const email = this.props.data?.email || user.email;
    return (
      <div id="start-kyc-modal">
        <h2 className="pb-2">A KYC link has been sent to {email}!</h2>
        <p className="mt-2 mb-3">
          {`Check your inbox to begin the KYC/AML process. If you do not see the link in a minute check your spam folder.`}
        </p>
        <div id="start-kyc-modal__buttons" className="pt-2">
          <button className="btn btn-primary" onClick={this.hideModal}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ConfirmKYCLink);
