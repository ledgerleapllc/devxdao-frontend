import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  removeActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import { updateShuftiproRefId } from "../../utils/Thunk";

import "./style.scss";

const mapStateToProps = () => {
  return {};
};

class ShuftiRefUpdate extends Component {
  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  doUpdateShufti = () => {
    const { user, newRefNumber } = this.props.data;
    const params = {
      user_id: user?.id,
      reference_id: newRefNumber,
    };
    this.props.dispatch(
      updateShuftiproRefId(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(showAlert(res.message, "success"));
          } else {
            this.props.dispatch(showAlert(res.message, "warning"));
          }
        }
      )
    );
  };

  // Render Content
  render() {
    const { user, newRefNumber } = this.props.data;
    const refNumber = user?.shuftipro?.reference_id;

    return (
      <div id="update-shuftiref-modal">
        <h4 className="pb-4">
          Are you sure you want to update the users Shufti Ref ID?
        </h4>
        <p>
          From <b>{refNumber}</b> to <b>{newRefNumber}</b>
        </p>
        <div className="actions">
          <button className="btn btn-primary" onClick={this.doUpdateShufti}>
            Update
          </button>
          <a onClick={this.hideModal} style={{ cursor: "pointer" }}>
            Cancel and Go back
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ShuftiRefUpdate));
