/* eslint-disable no-undef */
import { Tooltip } from "@material-ui/core";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  GlobalRelativeCanvasComponent,
  Checkbox,
} from "../../../../components";
import {
  setActiveModal,
  setCustomModalData,
  setKYCData,
  setOnboardingTableStatus,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";
import {
  forceWithdrawProposal,
  getPendingGrantOnboardings,
  resendComplianceReview,
  resendKycKangaroo,
  sendKycKangarooByAdmin,
  startFormalVoting,
} from "../../../../utils/Thunk";

import "./pending-grants.scss";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    onboardingTableStatus: state.table.onboardingTableStatus,
  };
};
const currentTime = moment(new Date());

class PendingGrants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onboardings: [],
      loading: false,
      sort_key: "onboarding.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      hide_denied: 0,
      calling: false,
      finished: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.startTracking();
    this.getOnboardings();
  }

  componentDidUpdate(prevProps) {
    const { onboardingTableStatus } = this.props;
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
    this.$elem = document.getElementById("app-pending-grants-sectionBody");
    this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (!this.$elem) return;
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

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getOnboardings(false);
    });
  }

  getOnboardings(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      hide_denied,
      search,
      page_id,
      onboardings,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    if (hide_denied) {
      params.hide_denied = hide_denied;
    }

    this.props.dispatch(
      getPendingGrantOnboardings(
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
          });
        }
      )
    );
  }

  renderTriangle(key) {
    const { sort_key, sort_direction } = this.state;
    if (sort_key != key) return <span className="inactive">&#9650;</span>;
    else {
      if (sort_direction == "asc") return <span>&#9650;</span>;
      else return <span>&#9660;</span>;
    }
  }

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

  async clickKYC(item) {
    const { user } = item;
    if (!user || !user.id) return;
    await this.props.dispatch(setKYCData(user));
    await this.props.dispatch(setActiveModal("review-kyc"));
  }

  hideDenied = (val) => {
    this.setState({ hide_denied: val ? 1 : 0 }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.reloadTable();
      }, 500);
    });
  };

  clickSigned(item) {
    if (
      !item.proposal ||
      !item.proposal.signatures ||
      !item.proposal.signatures.length
    )
      return null;
    this.props.dispatch(
      setCustomModalData({
        signatures: {
          render: true,
          title: "Grant Agreement Signatures",
          data: item.proposal.signatures,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  // Force Withdraw
  clickForceWithdraw(item) {
    if (!confirm("Are you sure you are going to withdraw the formal voting?"))
      return;
    this.props.dispatch(
      forceWithdrawProposal(
        item.proposal_id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.reloadTable();
        }
      )
    );
  }

  // Start Formal Voting
  clickStartFormal(item, force = true) {
    if (!confirm("Are you sure you are going to start the formal voting?"))
      return;
    this.props.dispatch(
      startFormalVoting(
        item.proposal_id,
        force,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert(
                "Formal voting process has been started successfully",
                "success"
              )
            );
            this.reloadTable();
          }
        }
      )
    );
  }

  resendCompliance = (item) => {
    this.props.dispatch(
      resendComplianceReview(
        { proposalId: item.proposal_id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(showAlert("Resend Successfully", "success"));
            this.reloadTable();
          }
        }
      )
    );
  };

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("onboarding.updated_at")}
          >
            <label className="font-size-14">Proposal #</label>
            {this.renderTriangle("onboarding.updated_at")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("onboarding.updated_at")}
          >
            <label className="font-size-14">OP Email</label>
            {this.renderTriangle("onboarding.updated_at")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("onboarding.updated_at")}
          >
            <label className="font-size-14">Pass Date</label>
            {this.renderTriangle("onboarding.updated_at")}
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("onboarding.status")}
          >
            <label className="font-size-14">Status</label>
            {this.renderTriangle("onboarding.status")}
          </div>
          <div
            className="c-col-5 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">First Name</label>
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">Last Name</label>
          </div>
          <div className="c-col-8 c-cols">
            <label className="font-size-14">KYC/AML</label>
          </div>
          <div className="c-col-9 c-cols">
            <label className="font-size-14">Compliance Check</label>
          </div>
          <div className="c-col-10 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  resendKYC = (item) => {
    this.props.dispatch(
      resendKycKangaroo(
        { user_id: item.user_id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              setActiveModal("confirm-kyc-link", { email: item.user?.email })
            );
          }
        }
      )
    );
  };

  sendKYC = (item) => {
    this.props.dispatch(
      sendKycKangarooByAdmin(
        { user_id: item.user_id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.reloadTable();
            this.props.dispatch(
              setActiveModal("confirm-kyc-link", { email: item.user?.email })
            );
          }
        }
      )
    );
  };

  renderKYCStatus(item) {
    if (item.user?.shuftipro_temp) {
      if (!item.user?.shuftipro) {
        return (
          <div className="font-size-14 color-primary">
            <label>Pending</label>
            <a
              className="font-size-14 text-underline"
              onClick={() => this.resendKYC(item)}
            >
              resend email
            </a>
          </div>
        );
      } else if (item.user?.shuftipro.status === "pending") {
        const duration = moment.duration(
          currentTime.diff(moment(item.user?.shuftipro.created_at))
        );
        const days = Math.floor(duration.asDays());
        return (
          <div className="font-size-14 color-primary">
            <label>In Review</label>
            <span>{days} days</span>
          </div>
        );
      } else if (item.user?.shuftipro.status === "approved") {
        return (
          <div className="font-size-14 color-primary">
            <label>Approved</label>
          </div>
        );
      } else if (item.user?.shuftipro.status === "denied") {
        return (
          <div className="font-size-14 color-primary">
            <label>Denied</label>
          </div>
        );
      } else {
        return "";
      }
    } else {
      return (
        <div className="font-size-14 color-primary">
          <label>Not submitted</label>
          <a
            className="font-size-14 text-underline"
            onClick={() => this.sendKYC(item)}
          >
            Send email
          </a>
        </div>
      );
    }
  }

  // renderKYCStatus(item) {
  //   if (!item.shuftipro_status) {
  //     const { shuftipro_temp } = item.user;
  //     if (shuftipro_temp && shuftipro_temp.status == "booked")
  //       return <label className="font-size-14 color-primary">Processing</label>;
  //     return <label className="font-size-14">-</label>;
  //   }

  //   if (item.shuftipro_status == "approved")
  //     return (
  //       <label
  //         className="font-size-14 color-success"
  //         onClick={() => this.clickKYC(item)}
  //       >
  //         Pass (View)
  //       </label>
  //     );
  //   if (item.shuftipro_reviewed)
  //     return (
  //       <label
  //         className="font-size-14 color-danger"
  //         onClick={() => this.clickKYC(item)}
  //       >
  //         Fail (View)
  //       </label>
  //     );
  //   return (
  //     <label
  //       className="font-size-14 color-danger"
  //       onClick={() => this.clickKYC(item)}
  //     >
  //       Fail (Review)
  //     </label>
  //   );
  // }

  showReason = (item) => {
    this.props.dispatch(
      setActiveModal("show-denied-compliance", item.deny_reason)
    );
  };

  renderComplianceStatus(item) {
    if (item.compliance_status === "pending") {
      return (
        <div>
          <label className="font-size-14">Pending</label>
          <a
            className="font-size-14 text-underline"
            onClick={() => this.resendCompliance(item)}
          >
            resend email
          </a>
        </div>
      );
    }
    if (item.compliance_status === "denied") {
      return (
        <div>
          <label className="font-size-14">Denied</label>
          <a
            className="font-size-14 text-underline"
            onClick={() => this.showReason(item)}
          >
            show reason
          </a>
        </div>
      );
    }
    if (item.compliance_status === "approved") {
      return <label className="font-size-14 color-primary">Approved</label>;
    }
  }

  renderPaymentForm(item) {
    if (item.form_submitted) return <label className="font-size-14">Yes</label>;
    return <label className="font-size-14">No</label>;
  }

  renderAction(item) {
    let buttonHtml = null;
    if (
      item.shuftipro_status &&
      item.shuftipro_status == "approved" &&
      item.form_submitted &&
      item.signature_request_id &&
      item.hellosign_form &&
      item.status == "pending"
    ) {
      buttonHtml = (
        <a
          onClick={() => this.clickStartFormal(item, false)}
          className="btn btn-success extra-small"
        >
          Start Formal Voting
        </a>
      );
    } else if (item.status == "pending") {
      buttonHtml = (
        <a
          onClick={() => this.clickStartFormal(item, true)}
          className="font-size-14 dynamic-color"
        >
          <u>Force Start Formal Voting</u>
        </a>
      );
    }

    if (buttonHtml) {
      return (
        <Fragment>
          <div>{buttonHtml}</div>
          <div className="mt-2">
            <a
              className="font-size-14 dynamic-color"
              onClick={() => this.clickForceWithdraw(item)}
            >
              <u>Force Withdraw</u>
            </a>
          </div>
        </Fragment>
      );
    }

    return <label className="font-size-14">-</label>;
  }

  renderTitle(item) {
    return item.proposal_title;
  }

  renderHellosign(item) {
    return (
      <a
        className="font-size-14 dynamic-color"
        onClick={() => this.clickSigned(item)}
      >
        <u>Signed ({item.signed_count}/3)</u>
      </a>
    );
  }

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
            <div className="c-col-1 c-cols">
              <label className="font-size-14">{item.proposal_id}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14 text-elipse">
                <Link
                  to={`/app/user/${item.user.id}`}
                  style={{ color: "inherit" }}
                >
                  {item.user.email}
                </Link>
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">
                {moment(item.updated_at).local().format("M/D/YYYY")}{" "}
                {moment(item.updated_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14 color-primary">Pending</label>
            </div>
            <div className="c-col-5 c-cols">
              <Tooltip title={item.proposal_title} placement="bottom">
                <label className="font-size-14 font-weight-700">
                  <Link
                    to={`/app/proposal/${item.proposal_id}`}
                    style={{ color: "inherit" }}
                  >
                    {this.renderTitle(item)}
                  </Link>
                </label>
              </Tooltip>
            </div>
            <div className="c-col-6 c-cols">{item.user.first_name}</div>
            <div className="c-col-7 c-cols">{item.user.last_name}</div>
            <div className="c-col-8 c-cols">{this.renderKYCStatus(item)}</div>
            <div className="c-col-9 c-cols">
              {this.renderComplianceStatus(item)}
            </div>
            {/* <div className="c-col-7 c-cols">{this.renderPaymentForm(item)}</div>
            <div className="c-col-8 c-cols">{this.renderHellosign(item)}</div> */}
            <div className="c-col-10 c-cols">{this.renderAction(item)}</div>
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { loading, search } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-pending-grants-section" className="app-infinite-box">
        <div className="app-infinite-search-wrap">
          <label>Grant Proposals That Passed Informal Vote</label>
          <div className="d-flex">
            <Checkbox
              text="Hide denied"
              onChange={(val) => this.hideDenied(val)}
            />
            <input
              className="ml-4"
              type="text"
              value={search}
              onChange={this.handleSearch}
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="infinite-content">
          <div className="infinite-contentInner">
            {this.renderHeader()}
            <div className="infinite-body" id="app-pending-grants-sectionBody">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderOnboardings()
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PendingGrants);
