import React, { Component } from "react";
import { connect } from "react-redux";
import { removeActiveModal } from "../../redux/actions";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ShowDeniedCompliance extends Component {
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
    const reason = this.props.data;
    return (
      <div id="start-kyc-modal">
        <p className="text-center pb-2">{reason}</p>
        <div id="start-kyc-modal__buttons" className="pt-2">
          <button className="btn btn-primary" onClick={this.hideModal}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ShowDeniedCompliance);
