import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import Helper from "../../../../utils/Helper";
import { hideCanvas, saveUser, showCanvas } from "../../../../redux/actions";
import { Link } from "react-router-dom";

import "./new-grant-alert.scss";
import { dismissNewMemberAlert } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class NewGrantAlert extends Component {
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

    if (!authUser.is_admin && !authUser.press_dismiss) {
      return (
        <Fade distance={"20px"} right duration={200} delay={500}>
          <div id="app-newgrant-box" className="new-member">
            <img src="/parts.png" alt="" />
            <div>
              <label className="font-weight-700">
                Welcome to the portal! Are you here to submit a grant request?
              </label>
              <p className="font-size-12">{`Click the "My Proposals" tab to the left, then the button for "New Grant Proposal" to start the process. Please be aware that grants require a 100 Euro DOS Fee for all applications.`}</p>
            </div>
            <div className="d-flex flex-column actions">
              <Link
                to="/app/proposals"
                className="btn btn-primary less-small mb-1"
              >
                Request grant
              </Link>
              <button
                className="btn btn-primary less-small mt-1"
                onClick={this.dismiss}
              >
                Dismiss alert
              </button>
            </div>
          </div>
        </Fade>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps)(withRouter(NewGrantAlert));
