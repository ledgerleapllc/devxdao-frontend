import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  setReviewProposal,
  removeActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
  setAdminPendingProposalTableStatus,
} from "../../redux/actions";
import { FormInputComponent } from "../../components";
import { denyProposal } from "../../utils/Thunk";

import "./deny-proposal.scss";

const mapStateToProps = (state) => {
  return {
    reviewProposal: state.admin.reviewProposal,
  };
};

class DenyProposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: "",
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setReviewProposal({}));
  };

  deny = (e) => {
    e.preventDefault();
    const { reason } = this.state;
    const { reviewProposal } = this.props;

    if (!reviewProposal || !reviewProposal.id) return;

    if (!reason.trim()) {
      this.props.dispatch(showAlert("Input deny reason"));
      return;
    }

    this.props.dispatch(
      denyProposal(
        reviewProposal.id,
        reason,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.hideModal();
            this.props.dispatch(setAdminPendingProposalTableStatus(true));
          }
        }
      )
    );
  };

  inputReason = (e) => {
    this.setState({ reason: e.target.value });
  };

  render() {
    const { reviewProposal } = this.props;
    const { reason } = this.state;
    if (!reviewProposal || !reviewProposal.id) return null;

    return (
      <div id="deny-proposal-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2>Deny Proposal</h2>
        <label className="font-weight-700 font-size-14">
          Are you sure you want to deny this proposal?
        </label>

        <FormInputComponent
          placeholder="Deny Reason"
          value={reason}
          onChange={this.inputReason}
        />

        <div id="deny-proposal-modal__buttons">
          <a className="btn btn-danger" onClick={this.deny}>
            Deny
          </a>
          <a className="btn btn-primary" onClick={this.hideModal}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DenyProposal);
