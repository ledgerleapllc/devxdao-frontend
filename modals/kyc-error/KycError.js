import React, { Component } from "react";
import { connect } from "react-redux";
import { removeActiveModal } from "../../redux/actions";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class KycError extends Component {
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
    return (
      <div id="start-kyc-modal">
        <h2 className="pb-2">Your submission had a problem.</h2>
        <p className="mt-2 mb-3">
          {`Please click the link again from your prior submission. Your process was not complete when you submitted before.`}
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

export default connect(mapStateToProps)(KycError);
