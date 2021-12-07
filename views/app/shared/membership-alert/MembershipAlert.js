import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { BRAND } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";
import { hideCanvas, saveUser, showCanvas } from "../../../../redux/actions";

import "./membership-alert.scss";
import { dismissNewMemberAlert } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class MembershipAlert extends Component {
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
      dismissNewMemberAlert(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            const temp = this.props.authUser;
            temp.press_dismiss = 1;
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

    if (authUser.is_participant && !authUser.is_member) {
      // Associate
      return (
        <Fade distance={"20px"} right duration={200} delay={500}>
          <div id="app-membership-box">
            <img src="/parts.png" alt="" />
            <div style={{ paddingRight: 0 }}>
              <label className="font-weight-700">Welcome to the {BRAND}</label>
              <p className="font-size-12">{`Your current portal account level is Associate. Associates can view or comment on, or submit proposals. Voting requires the next account level, Voting Associate.`}</p>
            </div>
          </div>
        </Fade>
      );
    } else if (authUser.is_guest) {
      // Guest
      return (
        <Fade distance={"20px"} right duration={200} delay={500}>
          <div id="app-membership-box">
            <img src="/parts.png" alt="" />
            <div>
              <label className="font-weight-700">Welcome to the {BRAND}</label>
              <p className="font-size-12">{`Once you are done exploring, click the button to the right to register for an account to create proposals, request grants, and join discussions`}</p>
            </div>
            <a
              className="btn btn-primary btn-fluid small"
              onClick={this.clickRegister}
            >
              Register
            </a>
          </div>
        </Fade>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps)(withRouter(MembershipAlert));
