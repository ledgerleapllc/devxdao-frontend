/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import { FormInputComponent, FormSelectComponent } from "../../../components";
import { COUNTRYLIST } from "../../../utils/Constant";
import { showAlert, showCanvas, hideCanvas } from "../../../redux/actions";
import {
  forceApproveKYC,
  forceDenyKYC,
  updateProfileInfo,
} from "../../../utils/Thunk";

import "./info.scss";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.minDate = moment().set("year", 1900).set("month", 0).set("date", 1);
    this.maxDate = moment();
  }

  // Set DOB
  setDOB = (dob) => {
    const { onSetData } = this.props;
    if (onSetData) onSetData("dob", dob);
  };

  // Input Field
  inputField = (e, key) => {
    const { onSetData } = this.props;
    if (onSetData) onSetData(key, e.target.value);
  };

  // Click Cancel
  clickCancel = (e) => {
    if (e) e.preventDefault();
    const { onCancel } = this.props;
    if (onCancel) onCancel();
  };

  // Click Force Approve
  forceApprove = (e) => {
    e.preventDefault();
    this.props.dispatch(
      forceApproveKYC(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.clickCancel();
        }
      )
    );
  };

  // Click Force Deny
  forceDeny = (e) => {
    e.preventDefault();
    this.props.dispatch(
      forceDenyKYC(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.clickCancel();
        }
      )
    );
  };

  submit = (e) => {
    e.preventDefault();
    const {
      dob,
      country_citizenship,
      country_residence,
      address,
      address_2,
      city,
      zip,
      first_name,
      last_name,
    } = this.props;

    if (!dob) {
      this.props.dispatch(showAlert("Please input dob"));
      return;
    }

    const params = {
      dob: moment(dob).format("YYYY-MM-DD"),
      country_citizenship,
      country_residence,
      address,
      address_2,
      city,
      zip,
      first_name,
      last_name,
    };

    this.props.dispatch(
      updateProfileInfo(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            const { onSetData } = this.props;
            onSetData("step", 2);
          }
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const {
      dob,
      country_citizenship,
      country_residence,
      address,
      address_2,
      city,
      zip,
      first_name,
      last_name,
    } = this.props;

    return (
      <div id="verify-info-wrap">
        <form action="" method="POST" onSubmit={this.submit}>
          <div className="row">
            <div className="col-md-6">
              <label className="font-size-14 d-block mb-1">First Name</label>
              <FormInputComponent
                placeholder=""
                value={first_name}
                onChange={(e) => this.inputField(e, "first_name")}
                type="text"
                underlined={true}
                required={true}
              />
            </div>
            <div className="col-md-6">
              <label className="font-size-14 d-block mb-1">Last Name</label>
              <FormInputComponent
                placeholder=""
                value={last_name}
                onChange={(e) => this.inputField(e, "last_name")}
                type="text"
                underlined={true}
                required={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">DOB</label>
              <div className="custom-form-control underlined dob-picker-wrap">
                <DatePicker
                  className="dob-picker"
                  value={
                    dob && dob != "0000-00-00" ? moment(dob).toDate() : null
                  }
                  onChange={this.setDOB}
                  onCalendarClose={() => {}}
                  calendarIcon={""}
                  clearIcon={""}
                  minDate={this.minDate.toDate()}
                  maxDate={this.maxDate.toDate()}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">
                Country of Citizenship
              </label>
              <FormSelectComponent
                placeholder=""
                options={COUNTRYLIST}
                value={country_citizenship}
                onChange={(e) => this.inputField(e, "country_citizenship")}
                underlined={true}
                required={true}
              />
            </div>
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">
                Country of Residence
              </label>
              <FormSelectComponent
                placeholder=""
                options={COUNTRYLIST}
                value={country_residence}
                onChange={(e) => this.inputField(e, "country_residence")}
                underlined={true}
                required={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              <label className="font-size-14 d-block mb-1">Address</label>
              <FormInputComponent
                placeholder=""
                value={address}
                onChange={(e) => this.inputField(e, "address")}
                type="text"
                underlined={true}
                required={true}
              />
            </div>
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">Address 2</label>
              <FormInputComponent
                placeholder=""
                value={address_2}
                onChange={(e) => this.inputField(e, "address_2")}
                type="text"
                underlined={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">City</label>
              <FormInputComponent
                placeholder=""
                value={city}
                onChange={(e) => this.inputField(e, "city")}
                type="text"
                underlined={true}
                required={true}
              />
            </div>
            <div className="col-md-4">
              <label className="font-size-14 d-block mb-1">
                Zip/Postal Code
              </label>
              <FormInputComponent
                placeholder=""
                value={zip}
                onChange={(e) => this.inputField(e, "zip")}
                type="text"
                underlined={true}
                required={true}
              />
            </div>
          </div>

          <div id="verify-info-wrap__buttons">
            <button type="submit" className="btn btn-primary">
              Next
            </button>
            <a className="btn btn-danger" onClick={this.clickCancel}>
              Cancel
            </a>
          </div>

          {/*
          <div id="temp-link-wrap">
            <div className="temp-link">
              <a onClick={this.forceApprove}>
                {"Simulate Approved KYC Submission"}
              </a>
            </div>
            <div className="temp-link">
              <a onClick={this.forceDeny}>
                {"Simulate Not Approved KYC Submission"}
              </a>
            </div>
          </div>
          */}
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Info);
