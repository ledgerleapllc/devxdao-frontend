import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import { FormInputComponent, HiddenFieldComponent } from "../../../components";
import {
  saveUser,
  showAlert,
  showCanvas,
  hideCanvas,
  setActiveModal,
} from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { login } from "../../../utils/Thunk";

import "./login.scss";

const mapStateToProps = () => {
  return {};
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }

  clickGuest = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("start-guest"));
  };

  inputEmail = (e) => {
    this.setState({ email: e.target.value });
  };

  inputPassword = (e) => {
    this.setState({ password: e.target.value });
  };

  login = (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    if (!Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Input valid email address"));
      return;
    }

    if (!password) {
      this.props.dispatch(showAlert("Input password"));
      return;
    }

    this.props.dispatch(
      login(
        email,
        password,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());

          if (res.success && res.user) {
            const authUser = res.user;
            Helper.storeUser(authUser);
            this.props.dispatch(saveUser(authUser));
            // open start kyc here
            // if (
            //   authUser &&
            //   !authUser.is_super_admin &&
            //   !authUser.is_admin &&
            //   authUser.check_send_kyc === 1 &&
            //   !authUser.shuftipro_temp
            // ) {
            //   this.props.dispatch(setActiveModal("start-kyc"));
            // }
          }
        }
      )
    );
  };

  render() {
    const { email, password } = this.state;
    return (
      <div id="login-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <form
              autoComplete="off"
              action=""
              method="POST"
              onSubmit={this.login}
            >
              <input autoComplete="off" name="hidden" type="text" hidden />
              <div id="form-bg">
                <img src="/popup-bg-min.png" alt="" className="img-block" />
              </div>

              <h2 className="color-black position-relative">Sign In</h2>

              <HiddenFieldComponent type="text" />
              <HiddenFieldComponent type="password" />

              <FormInputComponent
                placeholder="Email"
                required={true}
                type="email"
                onChange={this.inputEmail}
                name="email"
                value={email}
              />

              <FormInputComponent
                placeholder="Password"
                type="password"
                required={true}
                onChange={this.inputPassword}
                name="password"
                value={password}
              />

              <button
                type="submit"
                id="login-btn"
                className="btn btn-primary position-relative"
              >
                {"Sign In"}
              </button>
              <Link
                to="/public-proposals"
                className={
                  "btn btn-primary-outline position-relative less-small mb-3"
                }
              >
                View Projects
              </Link>

              <p className="text-center color-dark font-size-12 position-relative mb-2">
                {"Forgot your password?"}
                <br />
                <Link className="link" to="/forgot-password">
                  Reset
                </Link>
              </p>

              <p className="text-center color-dark font-size-12 position-relative">
                {"Don't have an account?"}
                <br />
                <Link className="link" to="/register">
                  Register
                </Link>
              </p>

              {/*
              <div>
                <p className="mt-4 text-center color-dark font-size-12 position-relative">
                  Just exploring?
                </p>
                <a
                  className="btn btn-primary-outline position-relative mt-2"
                  onClick={this.clickGuest}
                >
                  Enter as Guest
                </a>
              </div>
              */}
            </form>
          </Fade>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Login);
