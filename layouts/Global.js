/* eslint-disable no-unreachable */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { GlobalCanvasComponent, PopupAlertComponent } from "../components";
import { hideAlert, setActiveModal } from "../redux/actions";
import {
  EditDenyModal,
  DenyProposalModal,
  UserReviewModal,
  CustomGlobalModal,
  StartGuestModal,
  DOSPaymentModal,
  DOSReviewModal,
  VerifyKYCModal,
  PaymentFormModal,
  ReviewKYCModal,
  PreRegisterActionModal,
  StartHellosignModal,
  HelpModal,
  MilestoneVoteModal,
  KycErrorModal,
  KycGrantModal,
  StartCheckSystemModal,
  ConfirmKYCLinkModal,
  StartKYCModal,
  ResendKycModal,
  ViewPaymentFormModal,
  MultipleMilestoneSubmitModal,
  ResetKYCModal,
  AdminToolsModal,
  ShuftiRefChangeModal,
  SessionTimeoutModal,
  CancelActiveSurveyModal,
  AddAdminBoxModal,
  StartMilestoneModal,
  MilestoneRejectionModal,
  AskRevokeAdminModal,
  AskUndoRevokeAdminModal,
  DraftProposalsModal,
  ShowSurveyVoterAnswerModal,
  ListVoterSurveyModal,
  ShowDeniedComplianceModal,
} from "../modals";

const mapStateToProps = (state) => {
  return {
    showAlert: state.global.showAlert,
    showAlertMessage: state.global.showAlertMessage,
    showAlertType: state.global.showAlertType,
    showCanvas: state.global.showCanvas,
    authUser: state.global.authUser,
    activeModal: state.global.activeModal,
    modalData: state.global.modalData,
  };
};

class Global extends Component {
  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.checkHelloSign();
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;
    if (
      authUser &&
      authUser.id &&
      JSON.stringify(prevProps.authUser) != JSON.stringify(authUser)
    )
      this.checkHelloSign();
  }

  checkHelloSign() {
    const { authUser } = this.props;
    const { profile } = authUser;
    if (
      !authUser.is_admin &&
      authUser.can_access &&
      authUser.email_verified &&
      profile &&
      profile.id
    ) {
      if (!profile.step_review) {
        this.props.dispatch(setActiveModal("start-checksystem"));
      }
      // Needs to do Hello Sign
      // this.props.dispatch(setActiveModal("start-hellosign"));
    }
  }

  hideAlert = () => {
    this.props.dispatch(hideAlert());
  };

  render() {
    const {
      showCanvas,
      showAlert,
      showAlertMessage,
      showAlertType,
      activeModal,
    } = this.props;

    return (
      <Fragment>
        {showCanvas ? <GlobalCanvasComponent /> : null}

        <PopupAlertComponent
          onClose={this.hideAlert}
          shown={showAlert}
          message={showAlertMessage}
          type={showAlertType}
        />

        {activeModal ? (
          <div className="custom-modals">
            {activeModal == "user-review-modal" ? (
              <UserReviewModal />
            ) : activeModal == "deny-proposal" ? (
              <DenyProposalModal />
            ) : activeModal == "edit-deny" ? (
              <EditDenyModal />
            ) : activeModal == "custom-global-modal" ? (
              <CustomGlobalModal />
            ) : activeModal == "start-guest" ? (
              <StartGuestModal />
            ) : activeModal == "dos-payment" ? (
              <DOSPaymentModal />
            ) : activeModal == "dos-review" ? (
              <DOSReviewModal />
            ) : activeModal == "verify-kyc" ? (
              <VerifyKYCModal />
            ) : activeModal == "payment-form" ? (
              <PaymentFormModal />
            ) : activeModal == "view-payment-form" ? (
              <ViewPaymentFormModal />
            ) : activeModal == "review-kyc" ? (
              <ReviewKYCModal />
            ) : activeModal == "show-denied-compliance" ? (
              <ShowDeniedComplianceModal data={this.props.modalData} />
            ) : activeModal == "reset-kyc" ? (
              <ResetKYCModal />
            ) : activeModal == "pre-register-action" ? (
              <PreRegisterActionModal />
            ) : activeModal == "start-hellosign" ? (
              <StartHellosignModal />
            ) : activeModal == "start-checksystem" ? (
              <StartCheckSystemModal />
            ) : activeModal == "start-kyc" ? (
              <StartKYCModal />
            ) : activeModal == "resend-kyc" ? (
              <ResendKycModal />
            ) : activeModal == "kyc-error" ? (
              <KycErrorModal />
            ) : activeModal == "kyc-grant" ? (
              <KycGrantModal />
            ) : activeModal == "multiple-milestone-submit" ? (
              <MultipleMilestoneSubmitModal data={this.props.modalData} />
            ) : activeModal == "admin-tools" ? (
              <AdminToolsModal data={this.props.modalData} />
            ) : activeModal == "shufti-ref-change" ? (
              <ShuftiRefChangeModal data={this.props.modalData} />
            ) : activeModal == "session-timeout" ? (
              <SessionTimeoutModal />
            ) : activeModal == "show-survey-voter-answer" ? (
              <ShowSurveyVoterAnswerModal data={this.props.modalData} />
            ) : activeModal == "list-survey-voters" ? (
              <ListVoterSurveyModal data={this.props.modalData} />
            ) : activeModal == "cancel-active-survey" ? (
              <CancelActiveSurveyModal data={this.props.modalData} />
            ) : activeModal == "confirm-kyc-link" ? (
              <ConfirmKYCLinkModal data={this.props.modalData} />
            ) : activeModal == "draft-proposals" ? (
              <DraftProposalsModal />
            ) : activeModal == "add-admin-box" ? (
              <AddAdminBoxModal />
            ) : activeModal == "ask-revoke-admin" ? (
              <AskRevokeAdminModal data={this.props.modalData} />
            ) : activeModal == "ask-undo-revoke-admin" ? (
              <AskUndoRevokeAdminModal data={this.props.modalData} />
            ) : activeModal == "start-milestone" ? (
              <StartMilestoneModal />
            ) : activeModal == "milestone-rejection" ? (
              <MilestoneRejectionModal data={this.props.modalData} />
            ) : activeModal == "help" ? (
              <HelpModal />
            ) : activeModal == "milestone-vote" ? (
              <MilestoneVoteModal data={this.props.modalData} />
            ) : null}
          </div>
        ) : null}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(Global);
