import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  GlobalRelativeCanvasComponent,
  SwitchButton,
} from "../../../../../components";
import {
  getAdminTeams,
  changeAdminPermission,
  resetPasswordAdmin,
  resendInvitedEmail,
} from "../../../../../utils/Thunk";
import { withRouter } from "react-router-dom";
import "./team.scss";
import {
  forceReloadAdminTeam,
  hideCanvas,
  setActiveModal,
  showAlert,
  showCanvas,
} from "../../../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadAdminTeam: state.admin.reloadAdminTeam,
  };
};

class TeamTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      sort_key: "id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      params: {},
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.startTracking();

    this.getData();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;

    // Start Tracking
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.startTracking();
    if (
      this.props.reloadAdminTeam &&
      this.props.reloadAdminTeam !== prevProps.reloadAdminTeam
    ) {
      this.props.dispatch(forceReloadAdminTeam(false));
      this.reloadTable();
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("milestone-all-scroll-track");
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
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

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getData(false);
    });
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  getData(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      data,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 15,
      ...this.state.params,
    };

    this.props.dispatch(
      getAdminTeams(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.users || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            data: [...data, ...result],
          });
        }
      )
    );
  }

  togglePermissions = (item, permission, value) => {
    const currentPermission = item.permissions.find(
      (x) => x.name === permission
    );
    if (currentPermission) {
      currentPermission.is_permission =
        +currentPermission.is_permission === 1 ? 0 : 1;
      const data = this.state.data;
      const inx = data.findIndex((x) => x.id === item.id);
      data[inx] = item;
      this.setState({
        data: [...data],
      });

      this.props.dispatch(
        changeAdminPermission(
          {
            id: item.id,
            permissions: {
              [permission]: value ? 1 : 0,
            },
          },
          () => {},
          () => {}
        )
      );
    }
  };

  askRevokeAdmin = (item) => {
    this.props.dispatch(setActiveModal("ask-revoke-admin", item));
  };

  askUndoRevokeAdmin = (item) => {
    this.props.dispatch(setActiveModal("ask-undo-revoke-admin", item));
  };

  doResetPWAdmin = (id) => {
    this.props.dispatch(
      resetPasswordAdmin(
        { id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert("Reset Password successfully!", "success")
            );
          }
        }
      )
    );
  };

  doResendInvitedEmail(id) {
    this.props.dispatch(
      resendInvitedEmail(
        { id },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert("Resend Email successfully!", "success")
            );
          }
        }
      )
    );
  }

  renderAdminStatus(item) {
    let colorText = "";
    if (item.admin_status === "active") {
      colorText = "color-success";
    } else if (item.admin_status === "revoked") {
      colorText = "color-danger";
    }
    return (
      <>
        <p className={`${colorText} text-capitalize`}>{item.admin_status}</p>
        {item.admin_status === "invited" && (
          <a
            className="mt-3 text-underline"
            style={{ cursor: "pointer" }}
            onClick={() => this.doResendInvitedEmail(item.id)}
          >
            resend
          </a>
        )}
      </>
    );
  }

  getPermission(item, type) {
    return !!item.permissions.find((x) => x.name === type)?.is_permission;
  }

  renderResult() {
    const { data } = this.state;
    const items = [];

    if (!data || !data.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    data.forEach((item) => {
      items.push(
        <li key={`all_mile_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{moment(item.created_at).format("M/D/YYYY h:mm A")}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.is_super_admin ? "Super Admin" : "Admin"}</p>
            </div>
            <div className="c-col-3 c-cols">{this.renderAdminStatus(item)}</div>
            <div className="c-col-4 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-5 c-cols">
              <p>
                {item.last_login_at
                  ? moment(item.last_login_at).format("M/D/YYYY h:mm A")
                  : ""}
              </p>
            </div>
            <div className="c-col-6 c-cols">
              <p>{item.last_login_ip_address}</p>
            </div>
            <div className="c-col-7 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "users")}
                  onChange={(e) =>
                    this.togglePermissions(item, "users", e.target.checked)
                  }
                />
              )}
            </div>
            <div className="c-col-8 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "new_proposal")}
                  onChange={(e) =>
                    this.togglePermissions(
                      item,
                      "new_proposal",
                      e.target.checked
                    )
                  }
                />
              )}
            </div>
            <div className="c-col-9 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "move_to_formal")}
                  onChange={(e) =>
                    this.togglePermissions(
                      item,
                      "move_to_formal",
                      e.target.checked
                    )
                  }
                />
              )}
            </div>
            <div className="c-col-10 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "grants")}
                  onChange={(e) =>
                    this.togglePermissions(item, "grants", e.target.checked)
                  }
                />
              )}
            </div>
            <div className="c-col-11 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "milestones")}
                  onChange={(e) =>
                    this.togglePermissions(item, "milestones", e.target.checked)
                  }
                />
              )}
            </div>
            <div className="c-col-12 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "global_settings")}
                  onChange={(e) =>
                    this.togglePermissions(
                      item,
                      "global_settings",
                      e.target.checked
                    )
                  }
                />
              )}
            </div>
            <div className="c-col-13 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "emailer")}
                  onChange={(e) =>
                    this.togglePermissions(item, "emailer", e.target.checked)
                  }
                />
              )}
            </div>
            <div className="c-col-14 c-cols">
              {!item.is_super_admin && (
                <SwitchButton
                  value={this.getPermission(item, "accounting")}
                  onChange={(e) =>
                    this.togglePermissions(item, "accounting", e.target.checked)
                  }
                />
              )}
            </div>
            <div className="c-col-15 c-cols">
              <div>
                {!item.is_super_admin && (
                  <button
                    className="btn btn-primary small mb-2"
                    onClick={() => this.doResetPWAdmin(item.id)}
                  >
                    Reset Password
                  </button>
                )}
                {!item.is_super_admin && item.admin_status !== "revoked" && (
                  <button
                    className="btn btn-danger small"
                    onClick={() => this.askRevokeAdmin(item)}
                  >
                    Revoke
                  </button>
                )}
                {!item.is_super_admin && item.admin_status === "revoked" && (
                  <button
                    className="btn btn-success small"
                    onClick={() => this.askUndoRevokeAdmin(item)}
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { loading } = this.state;
    return (
      <div className="teams-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Added Date</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Type</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Status</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Email</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Last Login</label>
              </div>
              <div className="c-col-6 c-cols">
                <label className="font-size-14">IP</label>
              </div>
              <div className="c-col-7 c-cols">
                <label className="font-size-14">Users</label>
              </div>
              <div className="c-col-8 c-cols">
                <label className="font-size-14">New Proposals</label>
              </div>
              <div className="c-col-9 c-cols">
                <label className="font-size-14">Move to Formal</label>
              </div>
              <div className="c-col-10 c-cols">
                <label className="font-size-14">Grants</label>
              </div>
              <div className="c-col-11 c-cols">
                <label className="font-size-14">Milestones</label>
              </div>
              <div className="c-col-12 c-cols">
                <label className="font-size-14">Global settings</label>
              </div>
              <div className="c-col-13 c-cols">
                <label className="font-size-14">Emailer</label>
              </div>
              <div className="c-col-14 c-cols">
                <label className="font-size-14">Accounting</label>
              </div>
              <div className="c-col-15 c-cols">
                <label className="font-size-14"></label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="milestone-all-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TeamTable));
