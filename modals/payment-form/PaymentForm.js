import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import {
  setPaymentFormData,
  removeActiveModal,
  showCanvas,
  hideCanvas,
  setOnboardingTableStatus,
} from "../../redux/actions";
import { COUNTRYLIST, CRYPTOTYPES } from "../../utils/Constant";
import { FormInputComponent, FormSelectComponent } from "../../components";
import { updatePaymentForm } from "../../utils/Thunk";

import "./payment-form.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    paymentFormData: state.modal.paymentFormData,
  };
};

class PaymentForm extends Component {
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
      bankRequired: true,
    };
  }

  componentDidMount() {
    const { paymentFormData } = this.props;
    const { bank, crypto } = paymentFormData;

    let bankRequired = true;
    if (crypto.public_address && crypto.type) bankRequired = false;

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
      bankRequired,
    });
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setPaymentFormData({}));
  };

  submit = (e) => {
    e.preventDefault();
    const { paymentFormData } = this.props;
    if (!paymentFormData || !paymentFormData.id) return;

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
      crypto_address,
      crypto_type,
    } = this.state;

    const params = {
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
      crypto_address,
      crypto_type,
    };

    this.props.dispatch(
      updatePaymentForm(
        paymentFormData.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setOnboardingTableStatus(true));
          }
        }
      )
    );
  };

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      const { crypto_address, crypto_type } = this.state;
      let bankRequired = true;
      if (crypto_address && crypto_type) bankRequired = false;

      this.setState({ bankRequired });
    });
  }

  renderCryptoDropdown(key, value) {
    const items = [];

    for (let i in CRYPTOTYPES) {
      items.push(
        <option key={`option_${i}`} value={i}>
          {CRYPTOTYPES[i]}
        </option>
      );
    }

    return (
      <select
        value={value}
        onChange={(e) => this.inputField(e, key)}
        className="custom-form-control"
        required
      >
        <option value="">Select...</option>
        {items}
      </select>
    );
  }

  render() {
    const { paymentFormData, authUser } = this.props;
    if (!paymentFormData || !paymentFormData.id || !authUser || !authUser.id)
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
      bankRequired,
    } = this.state;

    return (
      <div id="payment-form-modal">
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
                <FormInputComponent
                  type="text"
                  required={true}
                  value={crypto_address}
                  onChange={(e) => this.inputField(e, "crypto_address")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Which Blockchain?</label>
                {this.renderCryptoDropdown("crypto_type", crypto_type)}
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
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={bank_name}
                  onChange={(e) => this.inputField(e, "bank_name")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>IBAN Number</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={iban_number}
                  onChange={(e) => this.inputField(e, "iban_number")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>SWIFT Number</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={swift_number}
                  onChange={(e) => this.inputField(e, "swift_number")}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Account Holder Name</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={holder_name}
                  onChange={(e) => this.inputField(e, "holder_name")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Account Number</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={account_number}
                  onChange={(e) => this.inputField(e, "account_number")}
                />
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Bank Address</label>
            <FormInputComponent
              type="text"
              required={bankRequired}
              value={bank_address}
              onChange={(e) => this.inputField(e, "bank_address")}
            />
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Town / City</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={bank_city}
                  onChange={(e) => this.inputField(e, "bank_city")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Postal Code</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={bank_zip}
                  onChange={(e) => this.inputField(e, "bank_zip")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Country</label>
                <FormSelectComponent
                  required={bankRequired}
                  placeholder="Select"
                  options={COUNTRYLIST}
                  value={bank_country}
                  onChange={(e) => this.inputField(e, "bank_country")}
                />
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Account Holder Address</label>
            <FormInputComponent
              type="text"
              required={bankRequired}
              value={holder_address}
              onChange={(e) => this.inputField(e, "holder_address")}
            />
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Town / City</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={holder_city}
                  onChange={(e) => this.inputField(e, "holder_city")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Postal Code</label>
                <FormInputComponent
                  type="text"
                  required={bankRequired}
                  value={holder_zip}
                  onChange={(e) => this.inputField(e, "holder_zip")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form-row">
                <label>Country</label>
                <FormSelectComponent
                  required={bankRequired}
                  placeholder="Select"
                  options={COUNTRYLIST}
                  value={holder_country}
                  onChange={(e) => this.inputField(e, "holder_country")}
                />
              </div>
            </div>
          </div>

          <div className="mt-3" id="final-checkbox-wrap">
            <input id="final-checkbox" type="checkbox" required />
            <label htmlFor="final-checkbox">{`I understand that the provider of any grant is not responsible in any way for any tax requirements or liabilities related to my receiving of grant funds. Additionally, I understand that I should seek the advice of a local tax specialist who understands taxation in my jurisdiction for tax planning.`}</label>
          </div>

          <div id="payment-form-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={this.hideModal}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PaymentForm);
