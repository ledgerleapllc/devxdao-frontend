import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  removeActiveModal,
  setRefreshSingleUserPage,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import { updateShufti } from "../../utils/Thunk";

import "./style.scss";

const mapStateToProps = () => {
  return {};
};

class ShuftiRefChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: null,
      shuftiRef: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  doUpdateShufti = () => {
    const { user } = this.props.data;
    const { password } = this.state;
    this.props.dispatch(
      updateShufti(
        { userId: user.id, ref: this.state.shuftiRef, shufti_pass: password },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(showAlert("Update successfully!", "success"));
            this.props.dispatch(setRefreshSingleUserPage(true));
            this.hideModal();
          }
        }
      )
    );
  };

  // Render Content
  render() {
    return (
      <div id="add-admin-box-modal">
        <h4 className="pb-4">Enter the Shufti Reference ID</h4>
        <p className="pb-4">
          {`Note: this will also approve the user's KYC, please add only approved REF numbers.`}
        </p>
        <p className="pb-4">(Example: SP_REQUEST_205_0.6466914169164529)</p>
        <FormInputComponent
          value={this.state.shuftiRef}
          onChange={(e) => this.setState({ shuftiRef: e.target.value })}
          required={true}
        />
        <h4 className="py-4">Enter your password to update</h4>
        <FormInputComponent
          type="password"
          value={this.state.password}
          onChange={(e) => this.setState({ password: e.target.value })}
          required={true}
        />
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={this.doUpdateShufti}
            disabled={!this.state.shuftiRef}
          >
            Add/Update
          </button>
          <a onClick={this.hideModal} style={{ cursor: "pointer" }}>
            Cancel and Go back
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ShuftiRefChange));
