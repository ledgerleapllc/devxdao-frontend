/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { PageHeaderComponent } from "../../../../components";
import {
  setActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
  setCustomModalData,
  setRefreshSingleUserPage,
  setKYCData,
} from "../../../../redux/actions";
import {
  banUser,
  unbanUser,
  getSingleUserByAdmin,
  approveKYC,
  denyKYC,
  getReputationByUser,
  downloadCSVUserRep,
  exportProposalMentor,
  sendKycKangarooByAdmin,
} from "../../../../utils/Thunk";
import ProposalsView from "./proposals/Proposals";
import VotesView from "./votes/Votes";
import ReputationView from "./reputation/Reputation";
import ProposalMentorView from "./proposal-mentor";
import "./single-user.scss";
import { DECIMALS } from "../../../../utils/Constant";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    refreshSingleUserPage: state.admin.refreshSingleUserPage,
  };
};

class SingleUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: 0,
      user: {},
      loading: false,
      totalStaked: 0,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const userId = params.userId;
    this.setState({ userId }, () => {
      this.getUser();
    });
    this.props.dispatch(
      getReputationByUser(
        userId,
        params,
        () => {},
        (res) => {
          this.setState({
            totalStaked: res.total_staked,
          });
        }
      )
    );
  }

  componentDidUpdate(prevProps) {
    const { refreshSingleUserPage } = this.props;
    if (!prevProps.refreshSingleUserPage && refreshSingleUserPage) {
      this.getUser();
      this.props.dispatch(setRefreshSingleUserPage(false));
    }
  }

  getUser() {
    const { userId, loading } = this.state;
    if (loading) return;

    this.props.dispatch(
      getSingleUserByAdmin(
        userId,
        () => {
          this.setState({ loading: true });
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const user = res.user || {};
          this.setState({ user, loading: false });
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  // Click Reset Password
  clickResetPassword = (e) => {
    e.preventDefault();
    const { user } = this.state;
    this.props.dispatch(
      setCustomModalData({
        "reset-password": {
          render: true,
          title: "You are resetting password of this user",
          data: user,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Add Reputation
  clickAddRep = async (e) => {
    e.preventDefault();
    const { user } = this.state;
    await this.props.dispatch(
      setCustomModalData({
        "add-reputation": {
          render: true,
          title: "You are adding to this users reputation score",
          data: user,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Sub Reputation
  clickSubRep = async (e) => {
    e.preventDefault();
    const { user } = this.state;
    await this.props.dispatch(
      setCustomModalData({
        "sub-reputation": {
          render: true,
          title: "You are subtracting from this users reputation score",
          data: user,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Change User Type
  clickChangeUserType = async (e) => {
    e.preventDefault();
    const { user } = this.state;
    await this.props.dispatch(
      setCustomModalData({
        "change-user-type": {
          render: true,
          title: "You are changing this users type",
          data: user,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Change User AML
  clickChangeUserAML = async (e, field, value) => {
    e.preventDefault();
    const { user } = this.state;
    await this.props.dispatch(
      setCustomModalData({
        "change-user-aml": {
          render: true,
          title: "Please enter the updated information",
          data: user,
          field,
          value,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Change User AML
  clickChangeShuftiRef = async (e) => {
    e.preventDefault();
    const { user } = this.state;
    await this.props.dispatch(setActiveModal("shufti-ref-change", { user }));
  };

  downloadCSV = () => {
    const { user } = this.state;
    this.props.dispatch(
      downloadCSVUserRep(
        user.id,
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `user-${user.id}-rep.csv`);
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  downloadCSVMentor = () => {
    const { user } = this.state;
    this.props.dispatch(
      exportProposalMentor(
        user.id,
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `user-mentor.csv`);
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  banUser = (e) => {
    e.preventDefault();
    const { user } = this.state;

    if (!confirm("Are you sure you are going to ban this user?")) return;

    this.props.dispatch(
      banUser(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              showAlert("You've successfully banned this user", "success")
            );
            this.getUser();
          }
        }
      )
    );
  };

  unbanUser = (e) => {
    e.preventDefault();
    const { user } = this.state;

    if (!confirm("Are you sure you are going to unban this user?")) return;

    this.props.dispatch(
      unbanUser(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              showAlert("You've successfully unbanned this user", "success")
            );
            this.getUser();
          }
        }
      )
    );
  };

  clickApprove = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to approve this KYC?")) return;
    const { user } = this.state;
    this.props.dispatch(
      approveKYC(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.getUser();
        }
      )
    );
  };

  sendKYC = (item) => {
    this.props.dispatch(
      sendKycKangarooByAdmin(
        { user_id: item?.id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              setActiveModal("confirm-kyc-link", { email: item?.email })
            );
          }
          this.getUser();
        }
      )
    );
  };

  clickDeny = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to deny this KYC?")) return;
    const { user } = this.state;
    this.props.dispatch(
      denyKYC(
        user.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.getUser();
        }
      )
    );
  };

  clickReset = (e) => {
    const { user } = this.state;
    e.preventDefault();
    this.props.dispatch(setKYCData(user));
    this.props.dispatch(setActiveModal("reset-kyc"));
  };

  renderButtons() {
    const { user } = this.state;
    const upbuttons = [];
    const downbuttons = [];
    const thirdButtons = [];

    if (!user.banned) {
      upbuttons.push(
        <a
          key="button_ban"
          className="btn btn-danger btn-fluid extra-small"
          onClick={this.banUser}
        >
          Ban User
        </a>
      );
    } else {
      upbuttons.push(
        <a
          key="button_unban"
          className="btn btn-danger-outline btn-fluid extra-small"
          onClick={this.unbanUser}
        >
          Unban User
        </a>
      );
    }

    upbuttons.push(
      <a
        key="button_reset"
        className="btn btn-success btn-fluid extra-small"
        onClick={this.clickResetPassword}
      >
        Reset Password
      </a>
    );

    upbuttons.push(
      <a
        key="button_change_ut"
        className="btn btn-success-outline btn-fluid extra-small"
        onClick={this.clickChangeUserType}
      >
        Change User Type
      </a>
    );

    downbuttons.push(
      <a
        key="button_add_r"
        className="btn btn-primary btn-fluid extra-small"
        onClick={this.clickAddRep}
      >
        Add Reputation
      </a>
    );

    downbuttons.push(
      <a
        key="button_subtract_r"
        className="btn btn-primary-outline btn-fluid extra-small"
        onClick={this.clickSubRep}
      >
        Subtract Reputation
      </a>
    );

    if (user && user.shuftipro && user.shuftipro.id) {
      const shuftipro = user.shuftipro;
      if (!shuftipro.reviewed && shuftipro.status != "approved") {
        thirdButtons.push(
          <a
            key="button_approve_kyc"
            className="btn btn-warning btn-fluid extra-small"
            onClick={this.clickApprove}
          >
            Approve KYC
          </a>
        );

        thirdButtons.push(
          <a
            key="button_deny_kyc"
            className="btn btn-danger-outline btn-fluid extra-small"
            onClick={this.clickDeny}
          >
            Deny KYC
          </a>
        );

        thirdButtons.push(
          <a
            key="button_reset_kyc"
            className="btn btn-info btn-fluid extra-small"
            onClick={this.clickReset}
          >
            Reset KYC
          </a>
        );
      }
    }

    return (
      <Fragment>
        <div className="app-sup-section-button-row">{upbuttons}</div>
        <div className="app-sup-section-button-row mt-2">{downbuttons}</div>
        <div className="app-sup-section-button-row mt-2">{thirdButtons}</div>
      </Fragment>
    );
  }

  renderShuftiproStatus() {
    const { user } = this.state;
    if (user.shuftipro && user.shuftipro.id) {
      if (user.shuftipro.status == "approved") return "Approved";
      return "Denied";
    }

    if (user.shuftipro_temp && user.shuftipro_temp.status != "pending")
      return "Submitted";
    return "Not Submitted";
  }

  renderKYCInfo() {
    const { authUser } = this.props;
    const { user } = this.state;
    let approvedAt = null;
    let approver = null;
    if (user.shuftipro && user.shuftipro.manual_approved_at)
      approvedAt = moment(user.shuftipro.manual_approved_at + ".000Z").format(
        "M/D/YYYY"
      );
    if (user.shuftipro && user.shuftipro.manual_reviewer)
      approver = user.shuftipro.manual_reviewer;
    const new_kyc = user.shuftipro_temp?.invite_id;
    let data;
    if (user.shuftipro?.data) data = JSON.parse(user.shuftipro?.data);
    if (!new_kyc) {
      return (
        <section>
          <div className="app-sup-section">
            <div className="app-sup-row">
              <label>Date of Birth</label>
              <span>{user.profile.dob}</span>
            </div>
            <div className="app-sup-row">
              <label>Country of Citizenship</label>
              <span>{user.profile.country_citizenship}</span>
            </div>
            <div className="app-sup-row">
              <label>Country of Residence</label>
              <span>{user.profile.country_residence}</span>
            </div>
            <div className="app-sup-row">
              <label>Address</label>
              <div>
                <span>{user.profile.address}</span>
                {authUser.is_admin && (
                  <button
                    className="ml-4 btn btn-primary extra-small"
                    onClick={(e) =>
                      this.clickChangeUserAML(
                        e,
                        "address",
                        user.profile.address
                      )
                    }
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="app-sup-row">
              <label>City</label>
              <div>
                <span>{user.profile.city}</span>
                {authUser.is_admin && (
                  <button
                    className="ml-4 btn btn-primary extra-small"
                    onClick={(e) =>
                      this.clickChangeUserAML(e, "city", user.profile.city)
                    }
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="app-sup-row">
              <label>Postal / Zip Code</label>
              <div>
                <span>{user.profile.zip}</span>
                {authUser.is_admin && (
                  <button
                    className="ml-4 btn btn-primary extra-small"
                    onClick={(e) =>
                      this.clickChangeUserAML(e, "zip", user.profile.zip)
                    }
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="app-sup-row">
              <label>Overall Status</label>
              <span>{this.renderShuftiproStatus()}</span>
              {(!user.shuftipro_temp ||
                user.shuftipro_temp?.status === "pending") &&
                !!authUser.is_admin && (
                  <button
                    className="ml-4 btn btn-primary extra-small"
                    onClick={() => this.sendKYC(user)}
                  >
                    Update
                  </button>
                )}
            </div>
            {user.shuftipro && (
              <div className="app-sup-row">
                <label>Shufti Ref #</label>
                <span>{user.shuftipro?.reference_id}</span>
                {authUser.is_admin && (
                  <button
                    className="ml-4 btn btn-primary extra-small"
                    onClick={(e) =>
                      this.clickChangeShuftiRef(e, "zip", user.profile.zip)
                    }
                  >
                    Add/Update
                  </button>
                )}
              </div>
            )}
            {approvedAt ? (
              <div className="app-sup-row">
                <label>Manually Approved At</label>
                <span>{approvedAt}</span>
              </div>
            ) : null}
            {approver ? (
              <div className="app-sup-row">
                <label>Manually Approved By</label>
                <span>{approver}</span>
              </div>
            ) : null}
          </div>
        </section>
      );
    } else {
      return (
        <section>
          <div className="app-sup-section">
            <div className="app-sup-row">
              <label>KycKangaroo status</label>
              <span className="text-capitalize">{user?.shuftipro?.status}</span>
            </div>
            <div className="app-sup-row">
              <label>Invite ID</label>
              <span>{user?.shuftipro_temp?.invite_id}</span>
            </div>
            <div className="app-sup-row">
              <label>Shufti REFID</label>
              <span>{user?.shuftipro?.reference_id}</span>
            </div>
            <div className="app-sup-row">
              <label>Name Verified in KYC kangaroo</label>
              <span>
                {data?.address_document?.name?.first_name}{" "}
                {data?.address_document?.name?.last_name}
              </span>
            </div>
            <div className="app-sup-row">
              <label>Address Verified in KYC kangaroo</label>
              <span>{data?.address_document?.full_address}</span>
            </div>
            <div className="app-sup-row">
              <label>Country Verified in KYC kangaroo</label>
              <span>{data?.address_document?.country}</span>
            </div>
          </div>
        </section>
      );
    }
  }

  renderHellosignForm() {
    const { user } = this.state;
    const { profile } = user;
    if (profile.hellosign_form) {
      return (
        <a
          target="_blank"
          rel="noreferrer"
          href={process.env.NEXT_PUBLIC_BACKEND_URL + profile.hellosign_form}
          className="text-underline"
        >
          Click Here
        </a>
      );
    }
    return null;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    const { loading, user, totalStaked } = this.state;
    if (loading) return null;
    if (!user || !user.id) return <div>{`We can't find any details`}</div>;

    return (
      <div id="app-single-user-page">
        <PageHeaderComponent title="Back" />
        <div className="app-simple-section">
          <label className="app-sup-header">Basic Info</label>
          <section>
            <div className="app-sup-section">
              <div className="app-sup-row">
                <label>User ID</label>
                <span>{user.id}</span>
              </div>
              <div className="app-sup-row">
                <label>User Type</label>
                <span>
                  {user.is_member
                    ? "Voting Associate"
                    : user.is_participant
                    ? "Associate"
                    : "Guest"}
                </span>
              </div>
              {!!user.is_member && (
                <div className="app-sup-row">
                  <label>V%</label>
                  <span>
                    {user.total_voted && user.total_informal_votes
                      ? (
                          (user.total_voted / user.total_informal_votes) *
                          100
                        ).toFixed(DECIMALS)
                      : 0}
                    %
                  </span>
                </div>
              )}
              <div className="app-sup-row">
                <label>Registration Date</label>
                <span>{moment(user.created_at).format("M/D/YYYY")}</span>
              </div>
              <div className="app-sup-row">
                <label>Email</label>
                <span>{user.email}</span>
                {/*<a className="btn btn-primary extra-small">Update</a>*/}
              </div>
              <div className="app-sup-row">
                <label>Telegram</label>
                <span>{user.profile?.telegram}</span>
                {/*<a className="btn btn-primary extra-small">Update</a>*/}
              </div>
              <div className="app-sup-row">
                <label>First Name</label>
                <span>{user.first_name}</span>
                {/*<a className="btn btn-primary extra-small">Update</a>*/}
              </div>
              <div className="app-sup-row">
                <label>Last Name</label>
                <span>{user.last_name}</span>
                {/*<a className="btn btn-primary extra-small">Update</a>*/}
              </div>
              <div className="app-sup-row">
                <label>Forum Name</label>
                <span>{user.profile.forum_name}</span>
              </div>
              <div className="app-sup-row">
                <label>Company Name</label>
                <span>{user.company}</span>
                {/*<a className="btn btn-primary extra-small">Update</a>*/}
              </div>
              <div className="app-sup-row">
                <label>Associate Agreement</label>
                {this.renderHellosignForm()}
              </div>
              <div className="app-sup-row">
                <label>Associate Agreement Timestamp</label>
                <span>
                  {moment(
                    user?.profile?.associate_agreement_at + ".000Z"
                  ).format("MM/DD/YYYY hh:mm")}
                </span>
              </div>
              {user.member_no ? (
                <div className="app-sup-row">
                  <label>Voting Associate #</label>
                  <span>{user.member_no}</span>
                </div>
              ) : null}
              {user.member_at ? (
                <div className="app-sup-row">
                  <label>Voting Promotion Date</label>
                  <span>
                    {moment(user.member_at + ".000Z").format("M/D/YYYY")}
                  </span>
                </div>
              ) : null}
            </div>
          </section>
          {/* Section End */}
          <label className="app-sup-header">KYC / AML Info</label>
          {this.renderKYCInfo()}
          <label className="app-sup-header">Proposals ( as OP )</label>
          <section>
            <div className="app-sup-section">
              <ProposalsView userId={user.id} />
            </div>
          </section>
          <label className="app-sup-header">Votes</label>
          <section>
            <div className="app-sup-section">
              <VotesView userId={user.id} />
            </div>
          </section>
          <div className="d-flex justify-content-between">
            <label className="app-sup-header">Reputation</label>
            <div>
              <button
                className="btn btn-primary btn-download extra-small"
                onClick={() => this.downloadCSV()}
              >
                Download
              </button>
            </div>
          </div>
          <section>
            <div className="app-sup-section">
              <div className="mb-1 app-sup-row">
                <label>Total</label>
                <span>
                  {(user.profile.rep + Math.abs(totalStaked))?.toFixed(
                    DECIMALS
                  )}
                </span>
              </div>
              <div className="mb-1 app-sup-row">
                <label>Staked</label>
                <span>{Math.abs(totalStaked)?.toFixed(DECIMALS)}</span>
              </div>
              <div className="mb-1 app-sup-row">
                <label>Available</label>
                <span>{user.profile.rep?.toFixed(DECIMALS)}</span>
              </div>
              <div className="app-sup-row">
                <label>Minted Pending</label>
                <span>{user.profile.rep_pending?.toFixed(DECIMALS)}</span>
              </div>
              <ReputationView userId={user.id} />
            </div>
          </section>
          <div className="d-flex justify-content-between">
            <label className="app-sup-header">Mentor Hours</label>
            <div>
              <button
                className="btn btn-primary btn-download extra-small"
                onClick={() => this.downloadCSVMentor()}
              >
                Download
              </button>
            </div>
          </div>
          <section>
            <div className="app-sup-section">
              <ProposalMentorView userId={user.id} />
            </div>
          </section>
          <label className="app-sup-header">Admin Functions</label>
          <section>
            <div className="app-sup-section">{this.renderButtons()}</div>
          </section>
          {/* Section End */}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleUser));
