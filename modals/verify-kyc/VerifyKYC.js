/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { removeActiveModal } from "../../redux/actions";
import InfoView from "./info/Info";
import ShuftiproView from "./shuftipro/Shuftipro";

import "./verify-kyc.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class VerifyKYC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      dob: "",
      country_citizenship: "",
      country_residence: "",
      address: "",
      address_2: "",
      city: "",
      zip: "",
      first_name: "",
      last_name: "",
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id && authUser.profile) {
      const profile = authUser.profile;
      const {
        dob,
        country_citizenship,
        country_residence,
        address,
        address_2,
        city,
        zip,
      } = profile;
      this.setState({
        dob: dob && dob != "0000-00-00" ? dob : "",
        country_citizenship,
        country_residence,
        address,
        address_2,
        city,
        zip,
        first_name: authUser.first_name || "",
        last_name: authUser.last_name || "",
      });
    }
  }

  // Set Data
  setData = (key, value) => {
    this.setState({ [key]: value });
  };

  // Hide Modal
  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  // Render Content
  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const {
      step,
      dob,
      country_citizenship,
      country_residence,
      address,
      address_2,
      city,
      zip,
      first_name,
      last_name,
    } = this.state;

    return (
      <div id="verify-kyc-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h2 className="mb-5 text-center">Verify KYC</h2>

        {step == 1 ? (
          <InfoView
            dob={dob}
            country_citizenship={country_citizenship}
            country_residence={country_residence}
            address={address}
            address_2={address_2}
            city={city}
            zip={zip}
            first_name={first_name}
            last_name={last_name}
            onSetData={this.setData}
            onCancel={this.hideModal}
          />
        ) : (
          <ShuftiproView onSetData={this.setData} onCancel={this.hideModal} />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(VerifyKYC);
