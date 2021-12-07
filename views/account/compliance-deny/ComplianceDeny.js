import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import qs from "qs";
import "./style.scss";
import moment from "moment";
import { denyComplianceReview } from "../../../utils/Thunk";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";

const mapStateToProps = () => {
  return {};
};

class ComplianceDeny extends Component {
  constructor() {
    super();
    this.state = {
      reason: "",
      proposal: null,
      onboarding: null,
    };
  }

  deny = () => {
    const {
      location: { search },
      match: { params },
    } = this.props;
    const { proposalId } = params;
    const { token } = qs.parse(search, { ignoreQueryPrefix: true });
    this.props.dispatch(
      denyComplianceReview(
        { proposalId, token, reason: this.state.reason },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.setState({
              proposal: res.proposal,
              onboarding: res.onboarding,
            });
            this.props.dispatch(showAlert("Denied successfully!", "success"));
          }
        }
      )
    );
  };

  render() {
    const { proposal, onboarding } = this.state;
    return (
      <div id="signup-welcome-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <p className="text-center font-weight-500 font-size-18 mb-3">
              {`Compliance admin, please record the exact reason for denying this grant. Remember, this action is final and will stop this grant from moving ahead. Your reason will be shared with the OP.`}
            </p>
          </Fade>
          <textarea
            placeholder="Enter the reason you are denying this grant."
            value={this.state.reason}
            onChange={(e) => this.setState({ reason: e.target.value })}
            readOnly={!!proposal}
          ></textarea>
          {proposal && (
            <div className="text-center mb-3">
              <div>
                <label className="pr-2">Grant number:</label>
                <b>{proposal.id}</b>
              </div>
              <div>
                <label className="pr-2">Grant title:</label>
                <b>{proposal.title}</b>
              </div>
              <div>
                <label className="pr-2">Denial timestamp:</label>
                <b>
                  {moment(onboarding.compliance_reviewed_at)
                    .local()
                    .format("HH:mm M/D/YYYY")}
                </b>
              </div>
              <div>
                <label className="pr-2">Admin email:</label>
                <b>{onboarding.compliance_admin}</b>
              </div>
            </div>
          )}
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <div className="d-flex">
              <Link to="/" className="btn btn-primary-outline mr-2">
                {proposal ? "Close" : "Cancel"}
              </Link>
              {!proposal && (
                <button
                  className="btn btn-primary"
                  onClick={this.deny}
                  disabled={!this.state.reason}
                >
                  Deny Grant
                </button>
              )}
            </div>
          </Fade>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ComplianceDeny));
