/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import {
  BackButtonComponent,
  FormInputComponent,
  HiddenFieldComponent,
} from "../../../components";
import Helper from "../../../utils/Helper";
import { saveUser, showCanvas, hideCanvas } from "../../../redux/actions";
import { registerAdmin } from "../../../utils/Thunk";

import "./signup-admin.scss";

const mapStateToProps = () => {
  return {};
};

class SignupAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      code: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      messages: {},
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    this.setState({
      email: params.get("email"),
      code: params.get("code"),
    });
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

  saveMain() {
    const {
      first_name,
      last_name,
      email,
      code,
      password,
      password_confirm,
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

    if (!password || !password_confirm) {
      messages = {
        ...messages,
        password: "Password is required",
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

    if (!Helper.checkPassword(password)) {
      messages = {
        ...messages,
        password:
          "Please use a password with at least 8 characters including at least one number, one letter and one symbol",
      };
      this.setState({ messages });
      return;
    }

    let params = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password,
      email,
      code,
    };

    this.props.dispatch(
      registerAdmin(
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
    const { first_name, last_name, password, password_confirm } = this.state;

    return (
      <div id="signup-admin-page">
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

export default connect(mapStateToProps)(SignupAdmin);
