import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { getPendingUsersByAdmin } from "../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  setAdminPendingUserTableStatus,
  setCustomModalData,
  setActiveModal,
} from "../../../../redux/actions";
import { withRouter } from "react-router-dom";

import "./pending-users.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    pendingUserTableStatus: state.admin.pendingUserTableStatus,
  };
};

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false,
      sort_key: "users.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      callCount: 0,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    const { users } = this.state;

    this.getUsers();

    // Start Tracking
    if (users && users.length) this.startTracking();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    const { pendingUserTableStatus } = this.props;
    const { users } = this.state;

    // Start Tracking
    if ((!prevState.users || !prevState.users.length) && users && users.length)
      this.startTracking();

    if (!prevProps.pendingUserTableStatus && pendingUserTableStatus) {
      this.setState({ callCount: 0 }, () => {
        this.reloadTable();
      });
      this.props.dispatch(setAdminPendingUserTableStatus(false));
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-pending-users-sectionBody");
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
    this.setState({ page_id: 1, users: [], finished: false }, () => {
      this.getUsers();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getUsers(false);
    });
  }

  clickManage(user) {
    this.props.dispatch(
      setCustomModalData({
        "manage-access": {
          render: true,
          title: "You can allow/deny access of this user.",
          data: user,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  clickRow(user) {
    const { history } = this.props;
    history.push(`/app/user/${user.id}`);
  }

  getUsers(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      users,
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
      getPendingUsersByAdmin(
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
            users: [...users, ...result],
            callCount: callCount + 1,
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

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("users.email")}
          >
            <label className="font-size-14">Email</label>
            {this.renderTriangle("users.email")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("users.first_name")}
          >
            <label className="font-size-14">Alias</label>
            {this.renderTriangle("users.first_name")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("profile.telegram")}
          >
            <label className="font-size-14">Telegram</label>
            {this.renderTriangle("profile.telegram")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Action</label>
          </div>
          <div
            className="c-col-5 c-cols"
            onClick={() => this.clickHeader("users.created_at")}
          >
            <label className="font-size-14">Registered Date</label>
            {this.renderTriangle("users.created_at")}
          </div>
        </div>
      </div>
    );
  }

  renderUsers() {
    const { users } = this.state;
    const items = [];

    if (!users || !users.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    users.forEach((item, index) => {
      items.push(
        <li key={`user_${index}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">
                <b>{item.email}</b>
              </label>
            </div>
            <div className="c-col-2 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">
                {item.first_name} {item.last_name}
              </label>
            </div>
            <div className="c-col-3 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">{item.telegram}</label>
            </div>
            <div className="c-col-4 c-cols">
              <a
                className="btn btn-primary extra-small btn-fluid-small"
                onClick={() => this.clickManage(item)}
              >
                Manage Access
              </a>
            </div>
            <div className="c-col-5 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { loading, search, callCount, users } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;
    if ((!users || !users.length) && callCount < 2) return null;

    return (
      <section id="app-pending-users-section" className="app-infinite-box">
        <div className="app-infinite-search-wrap">
          <label>
            Pending Users Table&nbsp;&nbsp;
            <Icon.Info size={16} />
          </label>

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
            <div className="infinite-body" id="app-pending-users-sectionBody">
              {loading ? <GlobalRelativeCanvasComponent /> : this.renderUsers()}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Users));
