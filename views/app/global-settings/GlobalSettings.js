/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { TIMEUNITS } from "../../../utils/Constant";
import {
  showAlert,
  showCanvas,
  hideCanvas,
  setActiveModal,
  setCustomModalData,
  setMasterPasswordStatus,
} from "../../../redux/actions";
import { updateGlobalSettingsByAdmin } from "../../../utils/Thunk";
import Helper from "../../../utils/Helper";

import "./global-settings.scss";

const WAValidator = require("wallet-address-validator");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    masterPasswordStatus: state.admin.masterPasswordStatus,
  };
};

class GlobalSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      time_before_op_do: "",
      time_unit_before_op_do: "",
      can_op_start_informal: "",
      autostart_grant_formal_votes: "",
      autostart_simple_formal_votes: "",
      autostart_admin_grant_formal_votes: "",
      autostart_advance_payment_formal_votes: "",
      autoactivate_grants: "",
      gate_new_grant_votes: "",
      gate_new_milestone_votes: "",
      time_before_op_informal: "",
      time_unit_before_op_informal: "",
      time_before_op_informal_simple: "",
      time_unit_before_op_informal_simple: "",
      time_informal: "",
      time_unit_informal: "",
      time_formal: "",
      time_unit_formal: "",
      time_simple: "",
      time_unit_simple: "",
      time_milestone: "",
      time_unit_milestone: "",
      dos_fee_amount: "",
      btc_address: "",
      eth_address: "",
      rep_amount: "",
      minted_ratio: "",
      op_percentage: "",
      pass_rate: "",
      quorum_rate: "",
      pass_rate_simple: "",
      quorum_rate_simple: "",
      pass_rate_milestone: "",
      quorum_rate_milestone: "",
      // coo_email: "",
      cfo_email: "",
      board_member_email: "",
      compliance_admin: "",
      // president_email: "",
      need_to_approve: "",
    };
  }

  componentDidMount() {
    const { settings } = this.props;
    if (settings && JSON.stringify(settings) != "{}") this.initValues();
  }

  componentDidUpdate(prevProps) {
    const { settings, masterPasswordStatus } = this.props;
    if (
      JSON.stringify(prevProps.settings) == "{}" &&
      JSON.stringify(prevProps.settings) != JSON.stringify(settings)
    )
      this.initValues();

    if (!prevProps.masterPasswordStatus && masterPasswordStatus) {
      this.setState({ editing: true });
      this.props.dispatch(setMasterPasswordStatus(false));
    }
  }

  initValues() {
    const { settings } = this.props;
    this.setState({
      time_before_op_do: settings.time_before_op_do || "",
      time_unit_before_op_do: settings.time_unit_before_op_do || "",
      can_op_start_informal: settings.can_op_start_informal || "",
      autostart_grant_formal_votes: settings.autostart_grant_formal_votes || "",
      autostart_simple_formal_votes:
        settings.autostart_simple_formal_votes || "",
      autostart_admin_grant_formal_votes:
        settings.autostart_admin_grant_formal_votes || "",
      autostart_advance_payment_formal_votes:
        settings.autostart_advance_payment_formal_votes || "",
      autoactivate_grants: settings.autoactivate_grants || "",
      gate_new_grant_votes: settings.gate_new_grant_votes || "",
      gate_new_milestone_votes: settings.gate_new_milestone_votes || "",
      time_before_op_informal: settings.time_before_op_informal || "",
      time_unit_before_op_informal: settings.time_unit_before_op_informal || "",
      time_before_op_informal_simple:
        settings.time_before_op_informal_simple || "",
      time_unit_before_op_informal_simple:
        settings.time_unit_before_op_informal_simple || "",
      time_informal: settings.time_informal || "",
      time_unit_informal: settings.time_unit_informal || "",
      time_formal: settings.time_formal || "",
      time_unit_formal: settings.time_unit_formal || "",
      time_simple: settings.time_simple || "",
      time_unit_simple: settings.time_unit_simple || "",
      time_milestone: settings.time_milestone || "",
      time_unit_milestone: settings.time_unit_milestone || "",
      dos_fee_amount: settings.dos_fee_amount || "",
      btc_address: settings.btc_address || "",
      eth_address: settings.eth_address || "",
      rep_amount: settings.rep_amount || "",
      minted_ratio: settings.minted_ratio || "",
      op_percentage: settings.op_percentage || "",
      pass_rate: settings.pass_rate || "",
      quorum_rate: settings.quorum_rate || "",
      pass_rate_simple: settings.pass_rate_simple || "",
      quorum_rate_simple: settings.quorum_rate_simple || "",
      pass_rate_milestone: settings.pass_rate_milestone || "",
      quorum_rate_milestone: settings.quorum_rate_milestone || "",
      // coo_email: settings.coo_email || "",
      cfo_email: settings.cfo_email || "",
      board_member_email: settings.board_member_email || "",
      compliance_admin: settings.compliance_admin || "",
      // president_email: settings.president_email || "",
      need_to_approve: settings.need_to_approve || "",
    });
  }

  // Input Field
  inputField(e, key) {
    const { editing } = this.state;
    if (!editing) return;

    this.setState({ [key]: e.target.value });
  }

  // Input Float Field
  inputFloatField(e, key) {
    const { editing } = this.state;
    if (!editing) return;

    let value = e.target.value;
    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    this.setState({ [key]: value });
  }

  // Input Float4 Field
  inputFloat4Field(e, key) {
    const { editing } = this.state;
    if (!editing) return;

    let value = e.target.value;
    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 4);

    this.setState({ [key]: value });
  }

  inputIntField(e, key) {
    const { editing } = this.state;
    if (!editing) return;

    let value = e.target.value;
    if (value && isNaN(value)) value = "";
    if (value) value = parseInt(value).toString();
    if (value && parseInt(value) < 1) value = "";

    this.setState({ [key]: value });
  }

  // Set Check Box
  setCheckbox(value, key) {
    const { editing } = this.state;
    if (!editing) return;
    this.setState({ [key]: value });
  }

  // Click Edit
  clickEdit = (e) => {
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        "master-password": {
          render: true,
          title: "Please Enter the Master Password",
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Cancel
  clickCancel = (e) => {
    e.preventDefault();
    this.setState({ editing: false });
  };

  submit = (e) => {
    e.preventDefault();

    const {
      time_before_op_do,
      time_unit_before_op_do,
      can_op_start_informal,
      autostart_grant_formal_votes,
      autostart_simple_formal_votes,
      autostart_advance_payment_formal_votes,
      autostart_admin_grant_formal_votes,
      autoactivate_grants,
      gate_new_grant_votes,
      gate_new_milestone_votes,
      time_before_op_informal,
      time_unit_before_op_informal,
      time_before_op_informal_simple,
      time_unit_before_op_informal_simple,
      time_informal,
      time_unit_informal,
      time_formal,
      time_unit_formal,
      time_simple,
      time_unit_simple,
      time_milestone,
      time_unit_milestone,
      dos_fee_amount,
      eth_address,
      btc_address,
      rep_amount,
      minted_ratio,
      op_percentage,
      pass_rate,
      quorum_rate,
      pass_rate_simple,
      quorum_rate_simple,
      pass_rate_milestone,
      quorum_rate_milestone,
      // coo_email,
      cfo_email,
      board_member_email,
      compliance_admin,
      // president_email,
      need_to_approve,
    } = this.state;

    // if (!coo_email || !Helper.validateEmail(coo_email)) {
    //   this.props.dispatch(showAlert("Please input valid COO Email"));
    //   return;
    // }

    if (!cfo_email || !Helper.validateEmail(cfo_email)) {
      this.props.dispatch(showAlert("Please input valid CFO Email"));
      return;
    }

    if (!board_member_email || !Helper.validateEmail(board_member_email)) {
      this.props.dispatch(showAlert("Please input valid Board Member Email"));
      return;
    }

    if (!compliance_admin || !Helper.validateEmail(compliance_admin)) {
      this.props.dispatch(
        showAlert("Please input valid Compliance Admin Email")
      );
      return;
    }

    // if (!president_email || !Helper.validateEmail(president_email)) {
    //   this.props.dispatch(showAlert("Please input valid President Email"));
    //   return;
    // }

    if (!time_before_op_do.trim() || !time_unit_before_op_do) {
      this.props.dispatch(
        showAlert("Please input valid 'Time before OP can accept/deny change'")
      );
      return;
    }

    if (!time_before_op_informal.trim() || !time_unit_before_op_informal) {
      this.props.dispatch(
        showAlert("Please input valid 'Time before OP can start informal vote'")
      );
      return;
    }

    if (
      !time_before_op_informal_simple.trim() ||
      !time_unit_before_op_informal_simple
    ) {
      this.props.dispatch(
        showAlert("Please input valid 'Time before OP can start simple vote'")
      );
      return;
    }

    if (!time_informal.trim() || !time_unit_informal) {
      this.props.dispatch(
        showAlert("Please input valid 'Time allowed for informal voting'")
      );
      return;
    }

    if (!time_formal.trim() || !time_unit_formal) {
      this.props.dispatch(
        showAlert("Please input valid 'Time allowed for formal voting'")
      );
      return;
    }

    if (!time_simple.trim() || !time_unit_simple) {
      this.props.dispatch(
        showAlert(
          "Please input valid 'Time allowed for simple voting (formal & informal)'"
        )
      );
      return;
    }

    if (!time_milestone.trim() || !time_unit_milestone) {
      this.props.dispatch(
        showAlert(
          "Please input valid 'Time allowed for simple milestone (formal & informal)'"
        )
      );
      return;
    }

    if (!dos_fee_amount.trim() || !dos_fee_amount) {
      this.props.dispatch(showAlert("Please input DOS fee amount"));
      return;
    }

    if (!WAValidator.validate(eth_address, "ETH")) {
      this.props.dispatch(showAlert("Please input valid ETH payment address"));
      return;
    }

    if (!minted_ratio.trim() || !minted_ratio) {
      this.props.dispatch(showAlert("Please input minted ratio"));
      return;
    }

    if (parseFloat(minted_ratio) < 0 || parseFloat(minted_ratio) > 1) {
      this.props.dispatch(showAlert("Please input valid minted ratio (0 - 1)"));
      return;
    }

    if (!op_percentage.trim() || !op_percentage) {
      this.props.dispatch(showAlert("Please input OP percentage"));
      return;
    }

    if (parseFloat(op_percentage) < 0 || parseFloat(op_percentage) > 100) {
      this.props.dispatch(
        showAlert("Please input valid OP percentage (0 - 100)")
      );
      return;
    }

    if (!pass_rate.trim() || !pass_rate) {
      this.props.dispatch(showAlert("Please input Pass Rate"));
      return;
    }

    if (parseFloat(pass_rate) < 0 || parseFloat(pass_rate) > 100) {
      this.props.dispatch(
        showAlert("Please input valid Pass Rate percentage (0 - 100)")
      );
      return;
    }

    if (!pass_rate_simple.trim() || !pass_rate_simple) {
      this.props.dispatch(
        showAlert("Please input Pass Rate for Simple Proposal")
      );
      return;
    }

    if (
      parseFloat(pass_rate_simple) < 0 ||
      parseFloat(pass_rate_simple) > 100
    ) {
      this.props.dispatch(
        showAlert("Please input valid Pass Rate for Simple Proposal (0 - 100)")
      );
      return;
    }

    if (!pass_rate_milestone.trim() || !pass_rate_milestone) {
      this.props.dispatch(
        showAlert("Please input Pass Rate for Milestone Proposal")
      );
      return;
    }

    if (
      parseFloat(pass_rate_milestone) < 0 ||
      parseFloat(pass_rate_milestone) > 100
    ) {
      this.props.dispatch(
        showAlert(
          "Please input valid Pass Rate for Milestone Proposal (0 - 100)"
        )
      );
      return;
    }

    if (!quorum_rate.trim() || !quorum_rate) {
      this.props.dispatch(showAlert("Please input Quorum Rate"));
      return;
    }

    if (parseFloat(quorum_rate) < 0 || parseFloat(quorum_rate) > 100) {
      this.props.dispatch(
        showAlert("Please input valid Quorum Rate percentage (0 - 100)")
      );
      return;
    }

    if (!quorum_rate_simple.trim() || !quorum_rate_simple) {
      this.props.dispatch(
        showAlert("Please input Quorum Rate for Simple Proposal")
      );
      return;
    }

    if (
      parseFloat(quorum_rate_simple) < 0 ||
      parseFloat(quorum_rate_simple) > 100
    ) {
      this.props.dispatch(
        showAlert(
          "Please input valid Quorum Rate for Simple Proposal (0 - 100)"
        )
      );
      return;
    }

    if (!quorum_rate_milestone.trim() || !quorum_rate_milestone) {
      this.props.dispatch(
        showAlert("Please input Quorum Rate for Milestone Proposal")
      );
      return;
    }

    if (
      parseFloat(quorum_rate_milestone) < 0 ||
      parseFloat(quorum_rate_milestone) > 100
    ) {
      this.props.dispatch(
        showAlert(
          "Please input valid Quorum Rate for Milestone Proposal (0 - 100)"
        )
      );
      return;
    }

    const params = {
      // coo_email,
      cfo_email,
      board_member_email,
      compliance_admin,
      // president_email,
      time_before_op_do,
      time_unit_before_op_do,
      can_op_start_informal,
      autostart_grant_formal_votes,
      autostart_simple_formal_votes,
      autostart_admin_grant_formal_votes,
      autostart_advance_payment_formal_votes,
      autoactivate_grants,
      gate_new_grant_votes,
      gate_new_milestone_votes,
      time_before_op_informal,
      time_unit_before_op_informal,
      time_before_op_informal_simple,
      time_unit_before_op_informal_simple,
      time_informal,
      time_unit_informal,
      time_simple,
      time_unit_simple,
      time_milestone,
      time_unit_milestone,
      time_formal,
      time_unit_formal,
      dos_fee_amount,
      btc_address,
      eth_address,
      rep_amount,
      minted_ratio,
      op_percentage,
      pass_rate,
      quorum_rate,
      pass_rate_simple,
      quorum_rate_simple,
      pass_rate_milestone,
      quorum_rate_milestone,
      need_to_approve,
    };

    this.props.dispatch(
      updateGlobalSettingsByAdmin(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.setState({ editing: false });
            this.props.dispatch(
              showAlert("You've successfully updated the settings", "success")
            );
          }
        }
      )
    );
  };

  renderTimeUnitOptions() {
    const items = [];
    for (let i in TIMEUNITS) {
      items.push(
        <option key={`option_${i}`} value={i}>
          {TIMEUNITS[i]}
        </option>
      );
    }
    return items;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (!authUser.is_admin) return <Redirect to="/" />;

    const {
      // coo_email,
      cfo_email,
      board_member_email,
      compliance_admin,
      // president_email,
      time_before_op_do,
      time_unit_before_op_do,
      can_op_start_informal,
      time_before_op_informal,
      time_unit_before_op_informal,
      time_before_op_informal_simple,
      time_unit_before_op_informal_simple,
      time_informal,
      time_unit_informal,
      time_formal,
      time_unit_formal,
      time_simple,
      time_unit_simple,
      time_milestone,
      time_unit_milestone,
      editing,
      dos_fee_amount,
      eth_address,
      minted_ratio,
      op_percentage,
      pass_rate,
      quorum_rate,
      pass_rate_simple,
      quorum_rate_simple,
      pass_rate_milestone,
      quorum_rate_milestone,
      need_to_approve,
      autostart_grant_formal_votes,
      autostart_simple_formal_votes,
      autostart_admin_grant_formal_votes,
      autostart_advance_payment_formal_votes,
      autoactivate_grants,
      gate_new_grant_votes,
      gate_new_milestone_votes,
    } = this.state;

    return (
      <div id="app-global-settings-page" className="app-simple-section">
        <label id="app-global-settings-pageHeader">Global Settings</label>
        <form method="POST" action="" onSubmit={this.submit}>
          {/* <div className="c-form-row">
            <label>COO Email</label>
            <div>
              <input
                type="email"
                value={coo_email}
                onChange={(e) => this.inputField(e, "coo_email")}
                disabled={!editing}
                style={{ width: "250px" }}
              />
            </div>
          </div> */}
          <div className="c-form-row">
            <label>CFO Email</label>
            <div>
              <input
                type="email"
                value={cfo_email}
                onChange={(e) => this.inputField(e, "cfo_email")}
                disabled={!editing}
                style={{ width: "250px" }}
              />
            </div>
          </div>
          {/* <div className="c-form-row">
            <label>President Email</label>
            <div>
              <input
                type="email"
                value={president_email}
                onChange={(e) => this.inputField(e, "president_email")}
                disabled={!editing}
                style={{ width: "250px" }}
              />
            </div>
          </div> */}
          <div className="c-form-row">
            <label>Board Member Email</label>
            <div>
              <input
                type="email"
                value={board_member_email}
                onChange={(e) => this.inputField(e, "board_member_email")}
                disabled={!editing}
                style={{ width: "250px" }}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Compliance Admin</label>
            <div>
              <input
                type="email"
                value={compliance_admin}
                onChange={(e) => this.inputField(e, "compliance_admin")}
                disabled={!editing}
                style={{ width: "250px" }}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Time before OP can accept/deny change</label>
            <div>
              <input
                type="text"
                value={time_before_op_do}
                onChange={(e) => this.inputIntField(e, "time_before_op_do")}
                disabled={!editing}
              />
              <select
                value={time_unit_before_op_do}
                onChange={(e) => this.inputField(e, "time_unit_before_op_do")}
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>Does admin need to approve new users?</label>
            <div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("yes", "need_to_approve")}
              >
                {need_to_approve == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("no", "need_to_approve")}
              >
                {need_to_approve == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>
              Can OP start informal vote (if no, admins must start votes)
            </label>
            <div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("yes", "can_op_start_informal")}
              >
                {can_op_start_informal == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("no", "can_op_start_informal")}
              >
                {can_op_start_informal == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Autostart grant formal votes</label>
            <div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("yes", "autostart_grant_formal_votes")
                }
              >
                {autostart_grant_formal_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("no", "autostart_grant_formal_votes")
                }
              >
                {autostart_grant_formal_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Autostart simple formal votes:</label>
            <div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("yes", "autostart_simple_formal_votes")
                }
              >
                {autostart_simple_formal_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("no", "autostart_simple_formal_votes")
                }
              >
                {autostart_simple_formal_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Autostart admin grant formal votes:</label>
            <div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("yes", "autostart_admin_grant_formal_votes")
                }
              >
                {autostart_admin_grant_formal_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("no", "autostart_admin_grant_formal_votes")
                }
              >
                {autostart_admin_grant_formal_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Autostart Advance Payment formal votes:</label>
            <div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox(
                    "yes",
                    "autostart_advance_payment_formal_votes"
                  )
                }
              >
                {autostart_advance_payment_formal_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox(
                    "no",
                    "autostart_advance_payment_formal_votes"
                  )
                }
              >
                {autostart_advance_payment_formal_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Autoactivate grants</label>
            <div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("yes", "autoactivate_grants")}
              >
                {autoactivate_grants == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("no", "autoactivate_grants")}
              >
                {autoactivate_grants == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Gate new grant votes</label>
            <div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("yes", "gate_new_grant_votes")}
              >
                {gate_new_grant_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() => this.setCheckbox("no", "gate_new_grant_votes")}
              >
                {gate_new_grant_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Gate new milestone votes</label>
            <div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("yes", "gate_new_milestone_votes")
                }
              >
                {gate_new_milestone_votes == "yes" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>Yes</label>
              </div>
              <div
                className="c-form-check"
                onClick={() =>
                  this.setCheckbox("no", "gate_new_milestone_votes")
                }
              >
                {gate_new_milestone_votes == "no" ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <label>No</label>
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Time before OP can start informal vote</label>
            <div>
              <input
                type="text"
                value={time_before_op_informal}
                onChange={(e) =>
                  this.inputIntField(e, "time_before_op_informal")
                }
                disabled={!editing}
              />
              <select
                value={time_unit_before_op_informal}
                onChange={(e) =>
                  this.inputField(e, "time_unit_before_op_informal")
                }
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>Time before OP can start informal simple vote</label>
            <div>
              <input
                type="text"
                value={time_before_op_informal_simple}
                onChange={(e) =>
                  this.inputIntField(e, "time_before_op_informal_simple")
                }
                disabled={!editing}
              />
              <select
                value={time_unit_before_op_informal_simple}
                onChange={(e) =>
                  this.inputField(e, "time_unit_before_op_informal_simple")
                }
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>Time allowed for informal voting</label>
            <div>
              <input
                type="text"
                value={time_informal}
                onChange={(e) => this.inputIntField(e, "time_informal")}
                disabled={!editing}
              />
              <select
                value={time_unit_informal}
                onChange={(e) => this.inputField(e, "time_unit_informal")}
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>Time allowed for formal voting</label>
            <div>
              <input
                type="text"
                value={time_formal}
                onChange={(e) => this.inputIntField(e, "time_formal")}
                disabled={!editing}
              />
              <select
                value={time_unit_formal}
                onChange={(e) => this.inputField(e, "time_unit_formal")}
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>
              Time allowed for simple voting (formal &amp; informal)
            </label>
            <div>
              <input
                type="text"
                value={time_simple}
                onChange={(e) => this.inputIntField(e, "time_simple")}
                disabled={!editing}
              />
              <select
                value={time_unit_simple}
                onChange={(e) => this.inputField(e, "time_unit_simple")}
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>
              Time allowed for milestone voting (formal &amp; informal)
            </label>
            <div>
              <input
                type="text"
                value={time_milestone}
                onChange={(e) => this.inputIntField(e, "time_milestone")}
                disabled={!editing}
              />
              <select
                value={time_unit_milestone}
                onChange={(e) => this.inputField(e, "time_unit_milestone")}
                disabled={!editing}
              >
                <option value="">Select...</option>
                {this.renderTimeUnitOptions()}
              </select>
            </div>
          </div>
          <div className="c-form-row">
            <label>DOS Fee Amount in &euro;</label>
            <div>
              <input
                type="text"
                value={dos_fee_amount}
                onChange={(e) => this.inputIntField(e, "dos_fee_amount")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>ETH Payment Address</label>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  style={{ width: "100%" }}
                  value={eth_address}
                  onChange={(e) => this.inputField(e, "eth_address")}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>Minted Ratio</label>
            <div>
              <input
                type="text"
                value={minted_ratio}
                onChange={(e) => this.inputFloat4Field(e, "minted_ratio")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>OP Percentage</label>
            <div>
              <input
                type="text"
                value={op_percentage}
                onChange={(e) => this.inputFloatField(e, "op_percentage")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Pass Rate for Grant Proposal</label>
            <div>
              <input
                type="text"
                value={pass_rate}
                onChange={(e) => this.inputIntField(e, "pass_rate")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Quorum Rate for Grant Proposal</label>
            <div>
              <input
                type="text"
                value={quorum_rate}
                onChange={(e) => this.inputIntField(e, "quorum_rate")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Pass Rate for Simple Proposal</label>
            <div>
              <input
                type="text"
                value={pass_rate_simple}
                onChange={(e) => this.inputIntField(e, "pass_rate_simple")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Quorum Rate for Simple Proposal</label>
            <div>
              <input
                type="text"
                value={quorum_rate_simple}
                onChange={(e) => this.inputIntField(e, "quorum_rate_simple")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Pass Rate for Milestone Proposal</label>
            <div>
              <input
                type="text"
                value={pass_rate_milestone}
                onChange={(e) => this.inputIntField(e, "pass_rate_milestone")}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="c-form-row">
            <label>Quorum Rate for Milestone Proposal</label>
            <div>
              <input
                type="text"
                value={quorum_rate_milestone}
                onChange={(e) => this.inputIntField(e, "quorum_rate_milestone")}
                disabled={!editing}
              />
            </div>
          </div>

          <div id="c-button-wrap">
            {!editing ? (
              <a
                className="btn btn-primary less-small"
                onClick={this.clickEdit}
              >
                Edit
              </a>
            ) : (
              <Fragment>
                <button type="submit" className="btn btn-primary less-small">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-danger less-small"
                  onClick={this.clickCancel}
                >
                  Cancel
                </button>
              </Fragment>
            )}
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(GlobalSettings));
