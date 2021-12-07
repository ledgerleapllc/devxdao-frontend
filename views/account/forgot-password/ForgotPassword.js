import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { FormInputComponent, HiddenFieldComponent } from "../../../components";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { sendResetEmail } from "../../../utils/Thunk";

import "./forgot-password.scss";

const mapStateToProps = () => {
  return {};
};

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  inputEmail = (e) => {
    this.setState({ email: e.target.value });
  };

  submit = (e) => {
    e.preventDefault();
    const { email } = this.state;

    if (!Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Please input valid email"));
      return;
    }

    this.props.dispatch(
      sendResetEmail(
        email,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.setState({ email: "" });
        }
      )
    );
  };

  render() {
    const { email } = this.state;
    return (
      <div id="forgot-password-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <form action="" method="POST" onSubmit={this.submit}>
              <div id="form-bg">
                <img src="/popup-bg-min.png" alt="" className="img-block" />
              </div>

              <h2 className="color-black position-relative">
                Forgot Password?
              </h2>

              <HiddenFieldComponent type="email" />

              <FormInputComponent
                placeholder="Email"
                required={true}
                type="email"
                onChange={this.inputEmail}
                name="email"
                value={email}
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

export default connect(mapStateToProps)(ForgotPassword);
