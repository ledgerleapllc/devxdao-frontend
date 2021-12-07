/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import Tooltip from "@material-ui/core/Tooltip";
import { getOnboardings } from "../../../../utils/Thunk";
import {
  setActiveModal,
  setOnboardingTableStatus,
  setPaymentFormData,
} from "../../../../redux/actions";

import "./proposal-tracking.scss";
import * as Icon from "react-feather";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    onboardingTableStatus: state.table.onboardingTableStatus,
  };
};

class ProposalTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      onboardings: [],
      sort_key: "onboarding.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      callCount: 0,
      finished: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    const { onboardings } = this.state;

    this.getOnboardings();

    // Start Tracking
    if (onboardings && onboardings.length) this.startTracking();
  }

  componentDidUpdate(prevProps, prevState) {
    const { onboardingTableStatus } = this.props;
    const { onboardings } = this.state;

    // Start Tracking
    if (
      (!prevState.onboardings || !prevState.onboardings.length) &&
      onboardings &&
      onboardings.length
    )
      this.startTracking();

    // Update Table
    if (!prevProps.onboardingTableStatus && onboardingTableStatus) {
      this.reloadTable();
      this.props.dispatch(setOnboardingTableStatus(false));
    }
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-proposal-tracking-sectionBody");
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (
      this.$elem.scrollTop + this.$elem.clientHeight >=
      this.$elem.scrollHeight
    )
      this.runNextPage();
  };

  // Handle Search
  handleSearch = (e) => {
    this.setState({ search: e.target.value }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.reloadTable();
      }, 500);
    });
  };

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, onboardings: [], finished: false }, () => {
      this.getOnboardings();
    });
  }

  // Run Next Page
  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getOnboardings(false);
    });
  }

  // Click Payment Form
  clickPaymentForm = async (e, item) => {
    e.preventDefault();
    if (!item.proposal || !item.proposal.id || item.proposal.form_submitted)
      return;
    await this.props.dispatch(setPaymentFormData(item.proposal));
    await this.props.dispatch(setActiveModal("payment-form"));
  };

  // Click Begin KYC
  clickBeginKYC = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("verify-kyc"));
  };

  // Get Onboardings
  getOnboardings(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      onboardings,
      callCount,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    this.props.dispatch(
      getOnboardings(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.onboardings || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            onboardings: [...onboardings, ...result],
            callCount: callCount + 1,
          });
        }
      )
    );
  }

  // Render Title
  renderTitle(item) {
    if (!item.proposal) return "";
    return item.proposal.title;
  }

  // Check if Need to do KYC
  needToDoKYC() {
    const { authUser } = this.props;
    let flag = false;
    if (
      (!authUser.shuftipro || !authUser.shuftipro.id) &&
      (!authUser.shuftipro_temp || !authUser.shuftipro_temp.id)
    )
      flag = true;
    else if (
      (!authUser.shuftipro || !authUser.shuftipro.id) &&
      authUser.shuftipro_temp &&
      authUser.shuftipro_temp.status == "pending"
    )
      flag = true;
    return flag;
  }

  // Check if Has Pending
  hasPending() {
    const { onboardings } = this.state;
    if (onboardings && onboardings.length) {
      for (let i in onboardings) {
        const onboarding = onboardings[i];
        if (onboarding.status == "pending") return true;
      }
    }
    return false;
  }

  // Render Alert
  renderAlert() {
    const { onboardings } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;
    if (!onboardings || !onboardings.length) return null;
    if (!this.hasPending()) return null;

    if (this.needToDoKYC()) {
      return (
        <div id="app-kyc-box">
          <img src="/parts.png" alt="" />
          <div>
            <label className="font-weight-700">{`Congratulations! Your proposal has passed the informal voting stage.`}</label>
            <p className="font-size-12">{`You must now submit your KYC/AML and financial information to continue.`}</p>
          </div>
        </div>
      );
    }

    return null;
  }

  // Render Date
  renderDate(item) {
    return (
      <label className="font-size-14">
        {moment(item.updated_at).local().format("M/D/YYYY")}{" "}
        {moment(item.updated_at).local().format("h:mm A")}
      </label>
    );
  }

  // Render Form Column
  renderFormColumn(item) {
    let formSubmitted = false;
    if (item && item.proposal)
      formSubmitted = item.proposal.form_submitted ? true : false;

    if (formSubmitted)
      return <label className="font-size-14 color-success">Submitted</label>;

    return (
      <a
        className="btn btn-primary extra-small"
        onClick={(e) => this.clickPaymentForm(e, item)}
      >
        Start
      </a>
    );
  }

  // Render KYC Column
  renderKYCColumn() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (this.needToDoKYC()) {
      return (
        <a className="btn btn-primary extra-small" onClick={this.clickBeginKYC}>
          Start
        </a>
      );
    }

    const { shuftipro } = authUser;

    if (shuftipro && shuftipro.id) {
      if (shuftipro.status == "approved")
        return <label className="font-size-14 color-success">Pass</label>;
      else if (shuftipro.reviewed)
        return <label className="font-size-14 color-danger">Fail</label>;
    }

    return <label className="font-size-14 color-primary">Submitted</label>;
  }

  renderComplianceCheck = (item) => {
    return (
      <p className="font-size-14 text-capitalize">{item.compliance_status}</p>
    );
  };

  // Render Hellosign
  renderHellosign(item) {
    const proposal = item.proposal || {};
    if (proposal && proposal.id) {
      if (!proposal.signature_request_id || !proposal.hellosign_form)
        return <label className="font-size-14">Sent</label>;
      else return <label className="font-size-14">Signed</label>;
    }
    return null;
  }

  renderStatusLabel(text, type) {
    return <label className={`font-size-14 color-${type}`}>{text}</label>;
  }

  // Click Start
  resend = () => {
    this.props.dispatch(setActiveModal("resend-kyc"));
  };

  renderStatus(item) {
    const { dos_paid } = item;
    if (item.status == "payment") {
      if (dos_paid) return this.renderStatusLabel("Payment Clearing", "info");
      else return this.renderStatusLabel("Payment Waiting", "info");
    } else if (item.status == "pending") {
      if (item.user.shuftipro?.status === "pending") {
        return (
          <div>
            <p>{this.renderStatusLabel("Pending", "primary")}</p>
            <a
              className="text-underline font-size-14 color-primary"
              onClick={this.resend}
            >
              resend my link
            </a>
          </div>
        );
      } else if (item.user.shuftipro?.status === "denied") {
        return (
          <div>
            <p>{this.renderStatusLabel("Denied", "primary")}</p>
          </div>
        );
      } else if (item.user.shuftipro?.status === "approved") {
        return (
          <div>
            <p>{this.renderStatusLabel("Approved", "primary")}</p>
          </div>
        );
      } else {
        return (
          <div>
            <p>{this.renderStatusLabel("Not submitted", "primary")}</p>
            <a
              className="text-underline font-size-14 color-primary"
              onClick={this.resend}
            >
              resend my link
            </a>
          </div>
        );
      }
    } else if (item.status == "denied")
      return this.renderStatusLabel("Denied", "danger");
    else if (item.status == "completed")
      return this.renderStatusLabel("Completed", "");
    else if (item.status == "approved") {
      if (item.votes && item.votes.length) {
        if (item.votes.length > 1) {
          // Formal Vote
          const formalVote = item.votes[1];
          if (formalVote.status == "active") {
            return this.renderStatusLabel(
              <Fragment>
                Formal Voting
                <br />
                Live
              </Fragment>,
              "success"
            );
          } else {
            // Formal Vote Result
            if (formalVote.result == "success") {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  Passed
                </Fragment>,
                "success"
              );
            } else if (formalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  No Quorum
                </Fragment>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <Fragment>
                  Formal Voting
                  <br />
                  Failed
                </Fragment>,
                "danger"
              );
            }
          }
        } else {
          // Informal Vote
          const informalVote = item.votes[0];
          if (informalVote.status == "active")
            return this.renderStatusLabel(
              <Fragment>
                Informal Voting
                <br />
                Live
              </Fragment>,
              "success"
            );
          else {
            // Informal Vote Result
            if (informalVote.result == "success") {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  Passed
                </Fragment>,
                "success"
              );
            } else if (informalVote.result == "no-quorum") {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  No Quorum
                </Fragment>,
                "danger"
              );
            } else {
              return this.renderStatusLabel(
                <Fragment>
                  Informal Voting
                  <br />
                  Failed
                </Fragment>,
                "danger"
              );
            }
          }
        }
      } else return this.renderStatusLabel("In Discussion", "success");
    }
    return null;
  }

  // Render Onboardings
  renderOnboardings() {
    const { onboardings } = this.state;
    const items = [];

    if (!onboardings || !onboardings.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    onboardings.forEach((item, index) => {
      items.push(
        <li key={`onboarding_${index}`}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols">{item.proposal.id}</div>
            <div className="c-col-1 c-cols">{this.renderDate(item)}</div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">
                {item.proposal.type == "grant" ? "Grant" : "Simple"}
              </label>
            </div>
            <div className="c-col-4 c-cols">{this.renderStatus(item)}</div>
            <div className="c-col-5 c-cols">
              {this.renderComplianceCheck(item)}
            </div>

            {/* <div className="c-col-4 c-cols">{this.renderFormColumn(item)}</div>
            <div className="c-col-5 c-cols">{this.renderHellosign(item)}</div> */}
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  // Render Triangle
  renderTriangle(key) {
    const { sort_key, sort_direction } = this.state;
    if (sort_key != key) return <span className="inactive">&#9650;</span>;
    else {
      if (sort_direction == "asc") return <span>&#9650;</span>;
      else return <span>&#9660;</span>;
    }
  }

  // Click Header
  clickHeader(key) {
    let { sort_key, sort_direction } = this.state;
    if (sort_key == key)
      sort_direction = sort_direction == "asc" ? "desc" : "asc";
    else {
      sort_key = key;
      sort_direction = "desc";
    }

    this.setState({ sort_key, sort_direction }, () => {
      this.reloadTable();
    });
  }

  // Render Header
  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-0 c-cols">Proposal #</div>
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Date Passed</label>
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Type</label>
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">KYC</label>
          </div>
          <div className="c-col-5 c-cols">
            <label>
              <span className="mx-0 font-size-14 pr-2">Compliance checks</span>
              <Tooltip
                title="All grants in the portal must be reviewed for compliance. This process typically takes anywhere from one to seven days."
                placement="right-end"
              >
                <Icon.HelpCircle size="12" />
              </Tooltip>
            </label>
          </div>
          {/* <div className="c-col-4 c-cols">
            <label className="font-size-14">Payments Form</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Grant Agreement</label>
          </div> */}
        </div>
      </div>
    );
  }

  // Render Content
  render() {
    const { loading, onboardings, search, callCount } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;
    if ((!onboardings || !onboardings.length) && callCount < 2) return null;

    return (
      <Fade distance={"20px"} bottom duration={200} delay={500}>
        <Fragment>
          {this.renderAlert()}
          <section
            id="app-proposal-tracking-section"
            className="app-infinite-box"
          >
            <div className="app-infinite-search-wrap">
              <label>Proposal Tracking</label>

              <input
                type="text"
                value={search}
                onChange={this.handleSearch}
                placeholder="Search..."
              />
            </div>

            <div className="infinite-content">
              <div className="infinite-contentInner">
                {this.renderHeader()}
                <div
                  className="infinite-body"
                  id="app-proposal-tracking-sectionBody"
                >
                  {loading ? (
                    <GlobalRelativeCanvasComponent />
                  ) : (
                    this.renderOnboardings()
                  )}
                </div>
              </div>
            </div>
          </section>
        </Fragment>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ProposalTracking));
