/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  removeActiveModal,
  setDOSPaymentData,
  showAlert,
  showCanvas,
  hideCanvas,
  setAdminActiveProposalTableStatus,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { FormInputComponent } from "../../components";
import CheckoutForm from "./CheckoutForm";
import {
  stakeCC,
  stakeReputation,
  updatePaymentProposal,
} from "../../utils/Thunk";
import { DECIMALS } from "../../utils/Constant";

import "./dos-payment.scss";

const promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const mapStateToProps = (state) => {
  return {
    dosPaymentData: state.modal.dosPaymentData,
    settings: state.global.settings,
    authUser: state.global.authUser,
  };
};

class DOSPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      eth_amount: "",
      txid: "",
      rep: "",
    };
  }

  componentDidMount() {
    const { settings } = this.props;
    if (settings && settings.eth_price && settings.dos_fee_amount)
      this.initValues();
  }

  componentDidUpdate(prevProps) {
    const { settings } = this.props;
    if (
      (!prevProps.settings ||
        !prevProps.settings.eth_price ||
        !prevProps.settings.dos_fee_amount) &&
      settings &&
      settings.eth_price &&
      settings.dos_fee_amount
    )
      this.initValues();
  }

  initValues() {
    const { settings } = this.props;
    const eth_price = parseFloat(settings.eth_price);
    const dos_fee_amount = parseFloat(settings.dos_fee_amount);
    let eth_amount = "";
    if (eth_price) {
      eth_amount = parseFloat(dos_fee_amount / eth_price);
      eth_amount = Helper.adjustNumericString(eth_amount.toString(), 5);
    }
    this.setState({ eth_amount });
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setDOSPaymentData({}));
  };

  // Click Pay in ETH
  clickPay = (e) => {
    e.preventDefault();
    this.setState({ step: 2 });
  };

  // Click Reputation
  clickRep = (e) => {
    e.preventDefault();
    this.setState({ step: 3 });
  };

  // Click Pay with Credit Card
  clickPayCC = (e) => {
    e.preventDefault();
    this.setState({ step: 4 });
  };

  inputTX = (e) => {
    this.setState({ txid: e.target.value });
  };

  inputRep = (e) => {
    let value = e.target.value;
    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);
    this.setState({ rep: value });
  };

  // Submit Simple Reputation
  submitSimpleRep = (e) => {
    e.preventDefault();

    const { dosPaymentData } = this.props;
    if (!dosPaymentData || !dosPaymentData.id) return;

    const { authUser } = this.props;
    const { profile } = authUser;

    let rep = 0;
    if (profile.rep) rep = parseFloat(profile.rep);

    if (rep < 1) {
      this.props.dispatch(showAlert("You don't have enough reputation"));
      return;
    }

    const params = {
      rep: 1,
    };

    this.props.dispatch(
      stakeReputation(
        dosPaymentData.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              showAlert(
                "You've successfully staked your reputation.",
                "success"
              )
            );
            await this.props.dispatch(setAdminActiveProposalTableStatus(false));
            await this.props.dispatch(setAdminActiveProposalTableStatus(true));
            this.hideModal();
          }
        }
      )
    );
  };

  // Submit Grant Reputation
  submitRep = (e) => {
    e.preventDefault();

    const { dosPaymentData } = this.props;
    if (!dosPaymentData || !dosPaymentData.id) return;

    const { rep } = this.state;
    const { authUser } = this.props;
    const { profile } = authUser;

    let max = parseFloat(profile.rep || 0) / 2;
    max = Helper.adjustNumericString(max.toString(), 2);
    max = parseFloat(max);

    if (!rep) {
      this.props.dispatch(showAlert("Please input amount of reputation"));
      return;
    }

    if (parseFloat(rep) < 0 || parseFloat(rep) > max) {
      this.props.dispatch(
        showAlert(`Please input value greater than 0 to ${max}`)
      );
      return;
    }

    const params = {
      rep,
    };

    this.props.dispatch(
      stakeReputation(
        dosPaymentData.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              showAlert(
                "You've successfully staked your reputation.",
                "success"
              )
            );
            await this.props.dispatch(setAdminActiveProposalTableStatus(false));
            await this.props.dispatch(setAdminActiveProposalTableStatus(true));
            this.hideModal();
          }
        }
      )
    );
  };

  submit = (e) => {
    e.preventDefault();
    const { txid, eth_amount } = this.state;
    const { dosPaymentData } = this.props;

    if (!dosPaymentData || !dosPaymentData.id) return null;

    if (!txid.trim()) {
      this.props.dispatch(showAlert("Please input tx id"));
      return;
    }
    if (!/^0x([A-Fa-f0-9]{64})$/.test(txid.trim())) {
      this.props.dispatch(showAlert("Please input valid tx id"));
      return;
    }

    const params = {
      dos_txid: txid,
      dos_eth_amount: eth_amount,
    };

    this.props.dispatch(
      updatePaymentProposal(
        dosPaymentData.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              showAlert(
                "Admin will review your tx and contact you shortly.",
                "success"
              )
            );
            this.hideModal();
            await this.props.dispatch(setAdminActiveProposalTableStatus(false));
            await this.props.dispatch(setAdminActiveProposalTableStatus(true));
          }
        }
      )
    );
  };

  renderInfo() {
    // const { authUser, dosPaymentData } = this.props;
    const { authUser } = this.props;

    let rep = 0;
    let max = 0;
    if (authUser.profile.rep) rep = parseFloat(authUser.profile.rep);

    max = parseFloat(rep / 2);
    max = Helper.adjustNumericString(max.toString(), 2);

    /*
    if (dosPaymentData && dosPaymentData.type == "simple") {
      return (
        <div className="mt-3">
          <label className="d-block font-size-14">
            Available Reputation: <b>{rep}</b>
          </label>
          <p className="font-size-14 mt-2">{`Click Submit below to stake 1 REP for this Simple Proposal. This will move the proposal into the discussion step.`}</p>
        </div>
      );
    }
    */

    return (
      <div className="mt-3">
        <label className="d-block font-size-14">
          Available Reputation: <b>{rep?.toFixed?.(DECIMALS)}</b>
        </label>
        <label className="d-block font-size-14 mt-1">
          Max Reputation for Staking (50%):
          <b> {parseFloat(max)?.toFixed?.(DECIMALS)}</b>
        </label>
      </div>
    );
  }

  renderText() {
    const { authUser, settings, dosPaymentData } = this.props;
    if (authUser.is_member) {
      if (dosPaymentData.type == "simple")
        return `This is a simple proposal, you will need to stake 1 REP to proceed. You must stake reputation between 1 and 1/2 of your available REP.`;
      return `You must stake reputation between 1 and 1/2 of your available REP. This reputation will be locked until you complete the proposed grant work.`;
    }
    return (
      <Fragment>
        Your proposal is ready to launch. To move your proposal ahead you must
        pay a dos fee of {settings.dos_fee_amount} Euros in ETH.
      </Fragment>
    );
  }

  renderButtons() {
    const { authUser } = this.props;

    if (authUser.is_member) {
      return (
        <a className="btn btn-primary-outline" onClick={this.clickRep}>
          Stake Reputation
        </a>
      );
    }

    return (
      <Fragment>
        <a className="btn btn-primary" onClick={this.clickPay}>
          Pay in ETH
        </a>
        <a className="font-size-14 btn btn-info" onClick={this.clickPayCC}>
          Pay with Credit Card
        </a>
        <a className="font-size-14 btn btn-warning" onClick={() => {}}>
          Pay with Casper Token
          <br />( coming soon )
        </a>
      </Fragment>
    );
  }

  // Render CC Result
  setCCResult = (result) => {
    if (!result) this.setState({ step: 6 });
    else {
      const { dosPaymentData } = this.props;
      this.props.dispatch(
        stakeCC(
          dosPaymentData.id,
          {},
          () => {
            this.props.dispatch(showCanvas());
          },
          async (res) => {
            this.props.dispatch(hideCanvas());
            if (res && res.success) {
              await this.props.dispatch(
                setAdminActiveProposalTableStatus(false)
              );
              await this.props.dispatch(
                setAdminActiveProposalTableStatus(true)
              );
              this.setState({ step: 5 });
            } else this.setState({ step: 6 });
          }
        )
      );
    }
  };

  // Credit Card Payment
  renderStep4() {
    const { dosPaymentData, settings } = this.props;
    return (
      <Fragment>
        <Elements stripe={promise}>
          <CheckoutForm
            proposalId={dosPaymentData.id}
            amount={settings.dos_fee_amount}
            onResult={this.setCCResult}
          />
        </Elements>
      </Fragment>
    );
  }

  // CC Successful
  renderStep5() {
    return (
      <Fragment>
        <p className="mt-3">
          Your transaction is <b>Approved!</b>
        </p>
        <p className="mt-3 mb-5">{`Your proposal will now move into the discussion phase. Please watch for changes and respond to posts in your "Discussions" tab.`}</p>
        <div className="text-center">
          <a className="btn btn-primary" onClick={this.hideModal}>
            Close
          </a>
        </div>
      </Fragment>
    );
  }

  goBack = () => {
    this.setState({ step: 1 });
  };

  // CC Error
  renderStep6() {
    return (
      <Fragment>
        <p className="mt-3">
          Your transaction is <b>Declined!</b>
        </p>
        <p className="mt-3 mb-5">{`You will need to go back and enter your card again or selected a different payment method. Your proposal cannot move forward until this is paid.`}</p>
        <div className="text-center">
          <a className="btn btn-primary" onClick={this.goBack}>
            Go Back
          </a>
        </div>
      </Fragment>
    );
  }

  // Submit Reputation
  renderStep3() {
    // const { dosPaymentData } = this.props;
    const { rep } = this.state;
    /*
    if (dosPaymentData.type == "simple") {
      return (
        <Fragment>
          {this.renderInfo()}

          <div id="dos-payment-modal__buttons">
            <a className="btn btn-primary" onClick={this.submitSimpleRep}>
              Submit
            </a>
          </div>
        </Fragment>
      );
    }
    */
    return (
      <Fragment>
        {this.renderInfo()}

        <div className="c-form-row mt-4">
          <FormInputComponent
            type="text"
            value={rep}
            onChange={this.inputRep}
            placeholder="Enter Amount of Reputation"
          />
        </div>

        <div id="dos-payment-modal__buttons">
          <a className="btn btn-primary" onClick={this.submitRep}>
            Submit
          </a>
        </div>
      </Fragment>
    );
  }

  render() {
    const { step, eth_amount, txid } = this.state;
    const { dosPaymentData, settings, authUser } = this.props;
    if (!dosPaymentData || !dosPaymentData.id || !authUser || !authUser.id)
      return null;

    if (
      !settings.dos_fee_amount ||
      !settings.eth_address ||
      !settings.eth_price ||
      !settings.btc_price
    ) {
      return (
        <div id="dos-payment-modal">
          <div className="custom-modal-close" onClick={this.hideModal}>
            <Icon.X />
            <label>Close Window</label>
          </div>

          <h2>DOS Fee Payment</h2>
          <p className="mt-3">
            Please contact administrator. Some settings are invalid.
          </p>
        </div>
      );
    }

    return (
      <div id="dos-payment-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2>DOS Fee Payment</h2>

        {step == 1 ? (
          <Fragment>
            <p className="mt-3">{this.renderText()}</p>
            <div id="dos-payment-modal__buttons">{this.renderButtons()}</div>
          </Fragment>
        ) : step == 2 ? (
          <Fragment>
            <p className="mt-3">
              Please sent <b>{eth_amount}</b> ETH to address{" "}
              <b>{settings.eth_address}</b> to pay your DOS Fee and enter the
              TXID from your ETH send below
            </p>

            <div className="c-form-row mt-4">
              <FormInputComponent
                type="text"
                value={txid}
                onChange={this.inputTX}
                placeholder="Enter TX ID"
              />
            </div>

            <div id="dos-payment-modal__buttons">
              <a className="btn btn-primary" onClick={this.submit}>
                Submit
              </a>
            </div>
          </Fragment>
        ) : step == 3 ? (
          this.renderStep3()
        ) : step == 4 ? (
          this.renderStep4()
        ) : step == 5 ? (
          this.renderStep5()
        ) : (
          this.renderStep6()
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(DOSPayment);
