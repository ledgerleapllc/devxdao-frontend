import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { Link, withRouter } from "react-router-dom";
import { hideCanvas, setActiveModal, showCanvas } from "../../../redux/actions";
import qs from "qs";
import "./style.scss";
import moment from "moment";
import { approveComplianceReview } from "../../../utils/Thunk";

const mapStateToProps = () => {
  return {};
};

class ComplianceApproved extends Component {
  clickGuest = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("start-guest"));
  };

  constructor() {
    super();
    this.state = {
      message: "",
      approvedData: null,
      onboarding: null,
      compliance_admin: "",
    };
  }

  componentDidMount() {
    const {
      location: { search },
      match: { params },
    } = this.props;
    const { proposalId } = params;
    const { token } = qs.parse(search, { ignoreQueryPrefix: true });
    this.props.dispatch(
      approveComplianceReview(
        { proposalId, token },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.setState({
              message:
                "Thank you compliance admin. Your approval has been recorded.",
              approvedData: res.proposal,
              onboarding: res.onboarding,
              compliance_admin: res.compliance_admin,
            });
          } else {
            this.setState({
              message: res.message,
              approvedData: res.data?.proposal,
              onboarding: res.data?.onboarding,
              compliance_admin: res.data?.compliance_admin,
            });
          }
        }
      )
    );
  }

  render() {
    const { approvedData, message, onboarding, compliance_admin } = this.state;
    return (
      <div id="signup-welcome-page">
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <>
              <p className="text-center font-weight-500 font-size-18 mb-3">
                {message}
              </p>
              {approvedData && (
                <div className="text-center">
                  <div>
                    <label className="pr-2">Grant number:</label>
                    <b>{approvedData.id}</b>
                  </div>
                  <div>
                    <label className="pr-2">Grant title:</label>
                    <b>{approvedData.title}</b>
                  </div>
                  <div>
                    <label className="pr-2">Approval timestamp:</label>
                    <b>
                      {moment(onboarding.compliance_reviewed_at)
                        .local()
                        .format("HH:mm M/D/YYYY")}
                    </b>
                  </div>
                  <div>
                    <label className="pr-2">Admin email:</label>
                    <b>{compliance_admin}</b>
                  </div>
                </div>
              )}
            </>
          </Fade>

          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <Link to="/" id="begin-btn" className="btn btn-primary mt-3">
              Close
            </Link>
          </Fade>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ComplianceApproved));
