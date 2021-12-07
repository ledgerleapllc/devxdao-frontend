import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import Helper from "../../../../utils/Helper";
import { hideCanvas, saveUser, showCanvas } from "../../../../redux/actions";

import "./first-grant-alert.scss";
import { dismissFirstCompletedGrantAlert } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class FirstGrantAlert extends Component {
  clickRegister = async (e) => {
    e.preventDefault();
    const { history } = this.props;
    Helper.storeUser({});
    await this.props.dispatch(saveUser({}));
    history.push("/register/form");
  };

  dismiss = (e) => {
    e.preventDefault();
    this.props.dispatch(
      dismissFirstCompletedGrantAlert(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            const temp = this.props.authUser;
            temp.check_first_compeleted_proposal = 0;
            this.props.dispatch(saveUser({ ...temp }));
          }
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (
      !authUser.is_admin &&
      authUser.is_member === 0 &&
      authUser.is_participant === 1 &&
      authUser.check_first_compeleted_proposal
    ) {
      return (
        <Fade distance={"20px"} right duration={200} delay={500}>
          <div id="app-firstgrant-box" className="new-member">
            <img src="/parts.png" alt="" />
            <div>
              <label>
                Congratulations, you finished your first grant. You may be
                eligible to become a voting associate. Please reach out in
                telegram for more details if interested.
              </label>
            </div>
            <div className="d-flex flex-column actions">
              <a
                target="_blank"
                href="https://t.me/devxdao"
                className="btn btn-primary less-small mb-1"
                rel="noreferrer"
              >
                Go to telegram
              </a>
              <button
                className="btn btn-primary less-small mt-1"
                onClick={this.dismiss}
              >
                Dismiss this notice
              </button>
            </div>
          </div>
        </Fade>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps)(withRouter(FirstGrantAlert));
