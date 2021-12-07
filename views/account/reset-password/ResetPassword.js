import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { withRouter } from "react-router-dom";
import { FormInputComponent, HiddenFieldComponent } from "../../../components";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { resetPassword } from "../../../utils/Thunk";

import "./reset-password.scss";

const mapStateToProps = () => {
  return {};
};

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      password_confirmation: "",
    };

    this.token = null;
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const urlParams = new URLSearchParams(window.location.search);

    this.token = params.token || null;
    const email = urlParams.get("email");

    if (email) {
      this.setState({
        email,
      });
    }
  }

  inputField = (e, key) => {
    this.setState({ [key]: e.target.value });
  };

  submit = (e) => {
    e.preventDefault();
    const { email, password, password_confirmation } = this.state;

    if (!email || !Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Input valid email address"));
      return;
    }

    if (!password || !password_confirmation) {
      this.props.dispatch(showAlert("Input password"));
      return;
    }

    if (password != password_confirmation) {
      this.props.dispatch(showAlert("Password doesn't match"));
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(
        showAlert(
          `Please use a password with at least 8 characters including at least one number, one letter and one symbol`
        )
      );
      return;
    }

    this.props.dispatch(
      resetPassword(
        {
          email,
          password,
          password_confirmation,
          token: this.token,
        },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/login");
          }
        }
      )
    );
  };

  render() {
    const { email, password, password_confirmation } = this.state;
    return (
      <div id="reset-password-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <form action="" method="POST" onSubmit={this.submit}>
              <div id="form-bg">
                <img src="/popup-bg-min.png" alt="" className="img-block" />
              </div>

              <h2 className="color-black position-relative">Reset Password</h2>

              <HiddenFieldComponent name="email" type="email" />
              <HiddenFieldComponent name="password" type="password" />

              <FormInputComponent
                placeholder="Email"
                required={true}
                type="email"
                onChange={(e) => this.inputField(e, "email")}
                value={email}
              />

              <FormInputComponent
                placeholder="Password"
                required={true}
                type="password"
                onChange={(e) => this.inputField(e, "password")}
                value={password}
              />

              <FormInputComponent
                placeholder="Confirm Password"
                required={true}
                type="password"
                onChange={(e) => this.inputField(e, "password_confirmation")}
                value={password_confirmation}
              />

              <button
                type="submit"
                className="btn btn-primary position-relative"
              >
                {"Submit"}
              </button>
            </form>
          </Fade>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ResetPassword));
