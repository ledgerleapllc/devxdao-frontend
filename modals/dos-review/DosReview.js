import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  removeActiveModal,
  hideCanvas,
  setAdminActiveProposalTableStatus,
  setAdminPendingProposalTableStatus,
  setDOSReviewData,
  showCanvas,
} from "../../redux/actions";
import { approveProposalPayment, denyProposalPayment } from "../../utils/Thunk";

import "./dos-review.scss";

const mapStateToProps = (state) => {
  return {
    dosReviewData: state.modal.dosReviewData,
    authUser: state.global.authUser,
  };
};

class DOSReview extends Component {
  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setDOSReviewData({}));
  };

  clickApprove = (e) => {
    const { dosReviewData } = this.props;
    if (!dosReviewData || !dosReviewData.id) return;
    e.preventDefault();
    if (!confirm("Are you sure you are going to approve the proposal payment?"))
      return;

    this.props.dispatch(
      approveProposalPayment(
        dosReviewData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(setAdminPendingProposalTableStatus(true));
            this.props.dispatch(setAdminActiveProposalTableStatus(true));
            this.hideModal();
          }
        }
      )
    );
  };

  clickDeny = (e) => {
    const { dosReviewData } = this.props;
    if (!dosReviewData || !dosReviewData.id) return;
    e.preventDefault();
    if (!confirm("Are you sure you are going to deny the proposal payment?"))
      return;

    this.props.dispatch(
      denyProposalPayment(
        dosReviewData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(setAdminPendingProposalTableStatus(true));
            this.props.dispatch(setAdminActiveProposalTableStatus(true));
            this.hideModal();
          }
        }
      )
    );
  };

  render() {
    const { dosReviewData, authUser } = this.props;
    if (!dosReviewData || !dosReviewData.id || !authUser || !authUser.id)
      return null;

    return (
      <div id="dos-review-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2>Review DOS Fee Payment</h2>

        <p className="mt-3">This user has paid with the following details</p>
        <p>Payment Type: ETH</p>
        <p>Paid Amount: {dosReviewData.dos_eth_amount}</p>
        <p>
          TX ID:{" "}
          <a
            rel="noreferrer"
            href={`https://etherscan.io/tx/${dosReviewData.dos_txid}`}
            target="_blank"
          >
            {dosReviewData.dos_txid}
          </a>
        </p>

        <p className="mt-3 mb-5">{`Approving payment will move launch this proposal. Denying this will reset the payment step.`}</p>

        <div id="dos-review-modal__buttons">
          <a className="btn btn-primary" onClick={this.clickApprove}>
            Approve
          </a>
          <a className="btn btn-danger" onClick={this.clickDeny}>
            Deny
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DOSReview);
