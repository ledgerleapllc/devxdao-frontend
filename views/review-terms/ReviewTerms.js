import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { hideCanvas, saveUser, showCanvas } from "../../redux/actions";
import { completeStepReview } from "../../utils/Thunk";

import "./review-terms.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ReviewTerms extends Component {
  verify = (e) => {
    const { authUser, history } = this.props;
    e.preventDefault();

    if (!authUser || !authUser.id) return;

    this.props.dispatch(
      completeStepReview(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());

          if (res.success) {
            let authUserNew = authUser;
            authUserNew.profile = {
              ...authUser.profile,
              step_review: 1,
            };
            this.props.dispatch(saveUser(authUserNew));
          }

          history.push("/verify-kyc");
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    if (authUser.is_admin || authUser.profile.step_review)
      return <Redirect to="/" />;

    return (
      <div id="review-terms-page">
        <div className="custom-container">
          <h1>Welcome!</h1>
          <p className="font-size-18">
            {`The DevDAO portal acts as a technology partner for Emergingte.ch. In
            this portal, you will sign the agreement governing the relationship
            between you and Emergingte.ch. Please review and e-sign the agreement
            below.`}
          </p>
          <a className="btn btn-primary" onClick={this.verify}>
            Begin Signing
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ReviewTerms));
