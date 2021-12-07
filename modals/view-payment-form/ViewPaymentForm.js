import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { removeActiveModal, setViewPaymentFormData } from "../../redux/actions";
// import { CRYPTOTYPES } from "../../utils/Constant";

import "./view-payment-form.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    viewPaymentFormData: state.modal.viewPaymentFormData,
  };
};

class ViewPaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bank_name: "",
      iban_number: "",
      swift_number: "",
      holder_name: "",
      account_number: "",
      bank_address: "",
      bank_city: "",
      bank_country: "",
      bank_zip: "",
      holder_address: "",
      holder_city: "",
      holder_country: "",
      holder_zip: "",
      crypto_address: "",
      crypto_type: "",
    };
  }

  componentDidMount() {
    const { viewPaymentFormData } = this.props;
    const { bank, crypto } = viewPaymentFormData;

    this.setState({
      bank_name: bank.bank_name || "",
      iban_number: bank.iban_number || "",
      swift_number: bank.swift_number || "",
      holder_name: bank.holder_name || "",
      account_number: bank.account_number || "",
      bank_address: bank.bank_address || "",
      bank_city: bank.bank_city || "",
      bank_country: bank.bank_country || "",
      bank_zip: bank.bank_zip || "",
      holder_address: bank.address || "",
      holder_city: bank.city || "",
      holder_country: bank.country || "",
      holder_zip: bank.zip || "",
      crypto_address: crypto.public_address || "",
      crypto_type: crypto.type || "",
    });
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setViewPaymentFormData({}));
  };

  render() {
    const { viewPaymentFormData, authUser } = this.props;
    if (
      !viewPaymentFormData ||
      !viewPaymentFormData.id ||
      !authUser ||
      !authUser.id
    )
      return null;

    const {
      bank_name,
      iban_number,
      swift_number,
      holder_name,
      account_number,
      bank_address,
      bank_city,
      bank_country,
      bank_zip,
      holder_address,
      holder_city,
      holder_country,
      holder_zip,
      // crypto_address,
      // crypto_type,
    } = this.state;

    return (
      <div id="view-payment-form-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2>Payment Detail</h2>

        <p className="mb-4">{`We gather this information for our accounting system and for paying fiat amounts to you (if necessary).`}</p>
        <p className="mb-4">{`All payments to Grantees are made in the currency of the DevXDAO’s choice at the time of the payment. Where the payment currency has a significant relative volatility to the EUR, the exchange rate shall be calculated based upon the 5 Period Trailing Moving Average of the Daily Volume Weighted Average Price on the day of the payment. Please enter your payment destination of last resort below.`}</p>

        <form action="" method="POST" onSubmit={this.submit}>
          {/*
          <label className="d-block mb-3">For Crypto Payments</label>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Wallet Address</label>
                <p>{crypto_address}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Which Blockchain?</label>
                <p>{CRYPTOTYPES[crypto_type]}</p>
              </div>
            </div>
          </div>*/}
          <label className="d-block mt-4 mb-3">
            For Euro Payments to Bank Accounts
          </label>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Bank Name</label>
                <p>{bank_name}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>IBAN Number</label>
                <p>{iban_number}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>SWIFT Number</label>
                <p>{swift_number}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Account Holder Name</label>
                <p>{holder_name}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Account Number</label>
                <p>{account_number}</p>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Bank Address</label>
            <p>{bank_address}</p>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Town / City</label>
                <p>{bank_city}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Postal Code</label>
                <p>{bank_zip}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Country</label>
                <p>{bank_country}</p>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Account Holder Address</label>
            <p>{holder_address}</p>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Town / City</label>
                <p>{holder_city}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Postal Code</label>
                <p>{holder_zip}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Country</label>
                <p>{holder_country}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ViewPaymentForm);
