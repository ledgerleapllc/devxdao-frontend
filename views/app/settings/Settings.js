import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { HiddenFieldComponent } from "../../../components";
import { showAlert, showCanvas, hideCanvas } from "../../../redux/actions";
import {
  changePassword,
  check2FA,
  disable2FALogin,
  enable2FALogin,
  generate2FA,
  getMe,
  updateAccountInfo,
  updateProfile,
} from "../../../utils/Thunk";
import Helper from "../../../utils/Helper";
// import SponsorCodesView from "./SponsorCodes";

import "./settings.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forum_name: "",
      current_password: "",
      new_password: "",
      confirm_new_password: "",
      disabled: true,
      email: "",
      emailStep: 0,
      code: "",
      code_new: "",
      twoFA_login: 0,
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.initValues();
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.initValues();
  }

  initValues() {
    const { authUser } = this.props;

    let forum_name = "";
    if (authUser.profile && authUser.profile.forum_name)
      forum_name = authUser.profile.forum_name;
    let twoFA_login = 0;
    if (authUser.profile && authUser.profile.twoFA_login)
      twoFA_login = authUser.profile.twoFA_login;

    this.setState({ forum_name, twoFA_login });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.checkButton();
    });
  }

  checkButton() {
    const {
      forum_name,
      current_password,
      new_password,
      confirm_new_password,
    } = this.state;
    const { authUser } = this.props;

    let changed = false;
    if (
      forum_name &&
      authUser &&
      authUser.profile &&
      forum_name != authUser.profile.forum_name
    )
      changed = true;
    else if (current_password || new_password || confirm_new_password)
      changed = true;

    this.setState({ disabled: !changed });
  }

  updateProfile() {
    const { authUser } = this.props;
    const { forum_name } = this.state;

    return new Promise((resolve) => {
      if (
        forum_name &&
        authUser &&
        authUser.profile &&
        forum_name != authUser.profile.forum_name
      ) {
        this.props.dispatch(
          updateProfile(
            { forum_name },
            () => {},
            () => {
              resolve(true);
            }
          )
        );
      } else resolve(false);
    });
  }

  changePassword() {
    const { current_password, new_password } = this.state;

    return new Promise((resolve) => {
      if (current_password && new_password) {
        const params = {
          current_password,
          new_password,
        };

        this.props.dispatch(
          changePassword(
            params,
            () => {},
            (res) => {
              resolve(res.success);
            }
          )
        );
      } else resolve(true);
    });
  }

  submit = (e) => {
    e.preventDefault();

    const {
      forum_name,
      current_password,
      new_password,
      confirm_new_password,
    } = this.state;

    if (!forum_name.trim()) {
      this.props.dispatch(showAlert("Please input forum name"));
      return;
    }

    if (current_password || new_password || confirm_new_password) {
      if (!current_password) {
        this.props.dispatch(showAlert("Please input current password"));
        return;
      }

      if (!new_password) {
        this.props.dispatch(showAlert("Please input new password"));
        return;
      }

      if (!confirm_new_password) {
        this.props.dispatch(showAlert("Please confirm new password"));
        return;
      }

      if (new_password != confirm_new_password) {
        this.props.dispatch(showAlert("Password doesn't match"));
        return;
      }

      if (!Helper.checkPassword(new_password)) {
        this.props.dispatch(
          showAlert(
            "Please use a password with at least 8 characters including at least one number, one letter and one symbol"
          )
        );
        return;
      }
    }

    this.props.dispatch(showCanvas());
    this.updateProfile().then(() => {
      this.changePassword().then((flag) => {
        if (!flag) this.props.dispatch(hideCanvas());
        else {
          this.props.dispatch(
            getMe(
              () => {},
              () => {
                this.props.dispatch(hideCanvas());
                this.setState({
                  disabled: true,
                  current_password: "",
                  new_password: "",
                  confirm_new_password: "",
                });
                this.props.dispatch(
                  showAlert(
                    "User settings have been updated successfully",
                    "success"
                  )
                );
              }
            )
          );
        }
      });
    });
  };

  startEmail = (e) => {
    e.preventDefault();
    const { email } = this.state;
    const { authUser } = this.props;

    if (authUser.email == email) {
      this.props.dispatch(showAlert("Please input different email address"));
      return;
    }

    if (!Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Please input valid email address"));
      return;
    }

    this.props.dispatch(generate2FA());
    this.setState({ emailStep: 1 });
  };

  verify2FA = (e) => {
    e.preventDefault();
    const { code, email } = this.state;

    this.props.dispatch(
      check2FA(
        code,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(generate2FA(email));
            this.setState({ emailStep: 2 });
          }
        }
      )
    );
  };

  completeEmail = (e) => {
    e.preventDefault();
    const { code_new, email } = this.state;

    this.props.dispatch(
      check2FA(
        code_new,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success && email) {
            this.props.dispatch(
              updateAccountInfo(
                { email },
                () => {},
                (res) => {
                  this.props.dispatch(hideCanvas());
                  if (res.success) {
                    this.clearEmailStep();
                    this.props.dispatch(
                      showAlert(
                        "You've changed your email successfully!",
                        "success"
                      )
                    );
                  }
                }
              )
            );
          } else this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  clearEmailStep = (e) => {
    e.preventDefault();
    this.setState({ email: "", emailStep: 0, code: "", code_new: "" });
  };

  toggleTwoFA = () => {
    const { twoFA_login } = this.state;
    this.setState({ twoFA_login: !twoFA_login }, () => {
      if (!twoFA_login) this.props.dispatch(enable2FALogin());
      else this.props.dispatch(disable2FALogin());
    });
  };

  // Render Email Section
  renderEmailSection() {
    const { authUser } = this.props;
    const { email, emailStep, code, code_new } = this.state;
    if (!emailStep) {
      return (
        <Fragment>
          <div className="c-form-row mt-5">
            <label className="mb-4">Change Email Address</label>
            <label className="font-size-12">
              Current Email: {authUser.email}
            </label>
            <input
              type="text"
              placeholder="Enter new email"
              value={email}
              onChange={(e) => this.inputField(e, "email")}
            />
          </div>
          <a
            className={
              email
                ? "btn btn-primary small btn-fluid mb-3"
                : "btn btn-primary small btn-fluid mb-3 disabled"
            }
            onClick={this.startEmail}
          >
            Start Change Email Process
          </a>
        </Fragment>
      );
    } else if (emailStep == 1) {
      return (
        <Fragment>
          <div className="c-form-row mt-5">
            <label className="mb-4">Change Email Address</label>
            <label className="font-size-12">
              Current Email: {authUser.email}
            </label>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => this.inputField(e, "code")}
            />
          </div>
          <div id="emailStep-buttons">
            <a
              className={
                code
                  ? "btn btn-primary small btn-fluid mb-3"
                  : "btn btn-primary small btn-fluid mb-3 disabled"
              }
              onClick={this.verify2FA}
            >
              Next
            </a>
            <a
              className="btn btn-danger small btn-fluid mb-3"
              onClick={this.clearEmailStep}
            >
              Cancel
            </a>
          </div>
        </Fragment>
      );
    } else if (emailStep == 2) {
      return (
        <Fragment>
          <div className="c-form-row mt-5">
            <label className="mb-4">Change Email Address</label>
            <label className="font-size-12">
              Current Email: {authUser.email}
            </label>
            <input
              type="text"
              placeholder="Enter code sent to your new email"
              value={code_new}
              onChange={(e) => this.inputField(e, "code_new")}
            />
          </div>
          <div id="emailStep-buttons">
            <a
              className={
                code_new
                  ? "btn btn-primary small btn-fluid mb-3"
                  : "btn btn-primary small btn-fluid mb-3 disabled"
              }
              onClick={this.completeEmail}
            >
              Complete
            </a>
            <a
              className="btn btn-danger small btn-fluid mb-3"
              onClick={this.clearEmailStep}
            >
              Cancel
            </a>
          </div>
        </Fragment>
      );
    }
    return null;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const {
      forum_name,
      current_password,
      new_password,
      confirm_new_password,
      disabled,
      twoFA_login,
    } = this.state;

    return (
      <div id="app-settings-page" className="app-simple-section">
        <label className="mb-5" id="app-settings-pageHeader">
          User Settings
        </label>

        <div>
          <form method="POST" action="" onSubmit={this.submit}>
            <HiddenFieldComponent type="text" />
            <HiddenFieldComponent type="password" />

            <div className="c-form-row">
              <label>My Pseudonym</label>
              <input
                type="text"
                placeholder="Forum Name/Pseudonym"
                value={forum_name}
                onChange={(e) => this.inputField(e, "forum_name")}
              />
            </div>
            {/*authUser.is_member ? (
              <div className="c-form-row">
                <label className="font-weight-700">Sponsor Codes</label>
                <p className="font-size-14">
                  {`These are used to sponsor proposals started by Associates. Each
                  code can only be used once.`}
                </p>
                <SponsorCodesView />
              </div>
            ) : null*/}
            <div className="c-form-row">
              <label>Change Password</label>
              <input
                type="password"
                placeholder="Type Current Password"
                value={current_password}
                onChange={(e) => this.inputField(e, "current_password")}
              />
              <input
                type="password"
                placeholder="New Password"
                value={new_password}
                onChange={(e) => this.inputField(e, "new_password")}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirm_new_password}
                onChange={(e) => this.inputField(e, "confirm_new_password")}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary small"
              disabled={disabled}
            >
              Save
            </button>
          </form>
          <div className="c-form-check-row" onClick={this.toggleTwoFA}>
            {twoFA_login ? (
              <Icon.CheckSquare color="#9B64E6" />
            ) : (
              <Icon.Square color="#9B64E6" />
            )}
            <label>Two-Factor Authentication</label>
          </div>
          {this.renderEmailSection()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Settings));
