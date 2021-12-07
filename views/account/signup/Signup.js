/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import * as Icon from "react-feather";
import {
  BackButtonComponent,
  FormInputComponent,
  HiddenFieldComponent,
} from "../../../components";
import Helper from "../../../utils/Helper";
import { saveUser, showCanvas, hideCanvas } from "../../../redux/actions";
import { getPreRegisterUserByHash, register } from "../../../utils/Thunk";

import "./signup.scss";

const mapStateToProps = () => {
  return {};
};

class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first_name: "",
      last_name: "",
      company: "",
      dob: "",
      country_citizenship: "",
      address: "",
      city: "",
      zip: "",
      country_residence: "",
      email: "",
      email_confirm: "",
      password: "",
      password_confirm: "",
      forum_name: "",
      telegram: "",
      checked_1: false,
      checked_2: false,
      checked_1_message: "",
      checked_2_message: "",
      messages: {},
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");

    if (hash) {
      this.props.dispatch(
        getPreRegisterUserByHash(
          hash,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res && res.data && res.data.id) {
              const data = res.data;
              this.setState({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                email_confirm: data.email,
              });
            }
          }
        )
      );
    }
  }

  inputFormField(e, key) {
    let { messages } = this.state;
    const value = e.target.value;
    if (value) {
      messages = {
        ...messages,
        [key]: "",
      };
    }
    this.setState({ [key]: value, messages });
  }

  toggleCheck1 = () => {
    let { checked_1, checked_1_message } = this.state;
    if (!checked_1) checked_1_message = "";
    this.setState({ checked_1: !checked_1, checked_1_message });
  };

  toggleCheck2 = () => {
    let { checked_2, checked_2_message } = this.state;
    if (!checked_2) checked_2_message = "";
    this.setState({ checked_2: !checked_2, checked_2_message });
  };

  saveMain() {
    const {
      first_name,
      last_name,
      company,
      email,
      email_confirm,
      password,
      password_confirm,
      forum_name,
      telegram,
      checked_1,
      checked_2,
    } = this.state;

    let messages = {};

    if (!first_name.trim()) {
      messages = {
        ...messages,
        first_name: "First name is required",
      };
      this.setState({ messages });
      return;
    }

    if (!last_name.trim()) {
      messages = {
        ...messages,
        last_name: "Last name is required",
      };
      this.setState({ messages });
      return;
    }

    if (!forum_name.trim()) {
      messages = {
        ...messages,
        forum_name: "Forum name is required",
      };
      this.setState({ messages });
      return;
    }

    if (!email.trim() || !email_confirm.trim()) {
      messages = {
        ...messages,
        email: "Email address is required",
      };
      this.setState({ messages });
      return;
    }

    if (!password || !password_confirm) {
      messages = {
        ...messages,
        password: "Password is required",
      };
      this.setState({ messages });
      return;
    }

    if (email.trim() != email_confirm.trim()) {
      messages = {
        ...messages,
        email: "Email doesn't match",
      };
      this.setState({ messages });
      return;
    }

    if (password != password_confirm) {
      messages = {
        ...messages,
        password: "Password doesn't match",
      };
      this.setState({ messages });
      return;
    }

    if (!Helper.validateEmail(email.trim())) {
      messages = {
        ...messages,
        email: "Email address is invalid",
      };
      this.setState({ messages });
      return;
    }

    if (!Helper.checkPassword(password)) {
      messages = {
        ...messages,
        password:
          "Please use a password with at least 8 characters including at least one number, one letter and one symbol",
      };
      this.setState({ messages });
      return;
    }

    if (!checked_1) {
      this.setState({ checked_1_message: "Please confirm the checkbox" });
      return;
    }

    if (!checked_2) {
      this.setState({ checked_2_message: "Please confirm the checkbox" });
      return;
    }

    let params = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      company: company.trim(),
      forum_name: forum_name.trim(),
      email: email.trim(),
      password,
      dob: "",
      country_citizenship: "",
      country_residence: "",
      address: "",
      city: "",
      zip: "",
      telegram: telegram.trim(),
    };

    // Check Existing Guest Key
    const guestKey = Helper.getGuestKey(false);
    if (guestKey) {
      params = {
        ...params,
        guest_key: guestKey,
      };
      Helper.removeGuestKey();
    }

    this.props.dispatch(
      register(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success && res.user) {
            Helper.storeUser(res.user);
            this.props.dispatch(saveUser(res.user));
          }
        }
      )
    );
  }

  // Form Submit
  save = (e) => {
    e.preventDefault();

    this.setState(
      {
        checked_1_message: "",
        checked_2_message: "",
        messages: {},
      },
      () => {
        this.saveMain();
      }
    );
  };

  // Render Error
  renderError(key) {
    const { messages } = this.state;
    if (messages[key]) {
      return (
        <label className="font-size-14 d-block color-danger mt-2">
          {messages[key]}
        </label>
      );
    }
    return null;
  }

  // Render Checkbox Error
  renderCheck1Error() {
    const { checked_1_message } = this.state;
    if (checked_1_message) {
      return (
        <label className="d-block color-danger mt-1 font-size-14">
          {checked_1_message}
        </label>
      );
    }
    return null;
  }

  // Render Checkbox Error
  renderCheck2Error() {
    const { checked_2_message } = this.state;
    if (checked_2_message) {
      return (
        <label className="d-block color-danger mt-1 font-size-14">
          {checked_2_message}
        </label>
      );
    }
    return null;
  }

  render() {
    const {
      first_name,
      last_name,
      company,
      email,
      email_confirm,
      password,
      password_confirm,
      forum_name,
      telegram,
      checked_1,
      checked_2,
    } = this.state;

    return (
      <div id="signup-page">
        <div className="custom-container">
          <Fade distance={"20px"} right duration={500} delay={400}>
            <div id="back-btn-wrap">
              <BackButtonComponent link="/register" />
            </div>
          </Fade>

          <form action="" method="POST" onSubmit={this.save}>
            <Fade distance={"20px"} right duration={500} delay={400}>
              <h1>New User</h1>
              <h5>Fill out the form to register</h5>
            </Fade>

            <HiddenFieldComponent type="text" />
            <HiddenFieldComponent type="password" />

            <div className="row">
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={400}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="First Name *"
                      type="text"
                      name="first_name"
                      value={first_name}
                      onChange={(e) => this.inputFormField(e, "first_name")}
                      underlined
                      required
                    />
                    {this.renderError("first_name")}
                  </div>
                </Fade>
              </div>
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={500}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Last Name *"
                      type="text"
                      name="last_name"
                      value={last_name}
                      onChange={(e) => this.inputFormField(e, "last_name")}
                      underlined
                      required
                    />
                    {this.renderError("last_name")}
                  </div>
                </Fade>
              </div>
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={600}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Company/Organization"
                      type="text"
                      name="company"
                      value={company}
                      onChange={(e) => this.inputFormField(e, "company")}
                      underlined
                    />
                    {this.renderError("company")}
                  </div>
                </Fade>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={400}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Email *"
                      type="email"
                      value={email}
                      onChange={(e) => this.inputFormField(e, "email")}
                      underlined
                      required
                    />
                    {this.renderError("email")}
                  </div>
                </Fade>
              </div>
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={500}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Confirm Email *"
                      type="email"
                      value={email_confirm}
                      onChange={(e) => this.inputFormField(e, "email_confirm")}
                      underlined
                      required
                    />
                  </div>
                </Fade>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={400}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Password *"
                      type="password"
                      value={password}
                      onChange={(e) => this.inputFormField(e, "password")}
                      underlined
                      required
                    />
                    {this.renderError("password")}
                  </div>
                </Fade>
              </div>
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={500}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Confirm Password *"
                      type="password"
                      value={password_confirm}
                      onChange={(e) =>
                        this.inputFormField(e, "password_confirm")
                      }
                      underlined
                      required
                    />
                  </div>
                </Fade>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={500}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Forum Name/Pseudonym *"
                      type="text"
                      value={forum_name}
                      onChange={(e) => this.inputFormField(e, "forum_name")}
                      underlined
                      required
                      maxLength="25"
                    />
                    <p className="font-size-12 color-primary mt-2">{`This will be the name shown alongside your forum post`}</p>
                    {this.renderError("forum_name")}
                  </div>
                </Fade>
              </div>
              <div className="col-md-4">
                <Fade distance={"20px"} bottom duration={500} delay={500}>
                  <div className="c-form-row">
                    <FormInputComponent
                      placeholder="Telegram *"
                      type="text"
                      value={Helper.formatTelegram(telegram)}
                      onChange={(e) => this.inputFormField(e, "telegram")}
                      underlined
                      required
                    />
                  </div>
                </Fade>
              </div>
            </div>

            <Fade distance={"20px"} bottom duration={500} delay={400}>
              <div className="c-checkbox-wrap" onClick={this.toggleCheck1}>
                {checked_1 ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <div>
                  <p className="font-size-14">
                    I understand that I am registering as a{" "}
                    <b className="color-primary">Associate</b> and will be{" "}
                    allowed to comment and submit proposals. I understand that I{" "}
                    will not be allowed to vote or receive grants unless I later{" "}
                    pass KYC and electronically sign the necessary documents.
                  </p>
                  {this.renderCheck1Error()}
                </div>
              </div>
            </Fade>

            <Fade distance={"20px"} bottom duration={500} delay={400}>
              <div className="c-checkbox-wrap" onClick={this.toggleCheck2}>
                {checked_2 ? (
                  <Icon.CheckSquare color="#9B64E6" />
                ) : (
                  <Icon.Square color="#9B64E6" />
                )}
                <div>
                  <p className="font-size-14">
                    {`I am not a citizen or resident of any of the following countries
                    - Balkans, Belarus, Burma, Cote D’Ivoire (Ivory Coast), Cuba,
                    Democratic Republic of Congo, Iran, Iraq, Liberia, North Korea,
                    Sudan, Syria, or Zimbabwe.`}
                  </p>
                  {this.renderCheck2Error()}
                </div>
              </div>
            </Fade>

            <Fade distance={"20px"} bottom duration={500} delay={400}>
              <div id="btn-wrap">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </Fade>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Signup);
