/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../components";
import {
  setActiveModal,
  setPreRegisterActionData,
  setPreRegisterTableStatus,
} from "../../../redux/actions";
import { getPreRegisterUsersByAdmin } from "../../../utils/Thunk";

import "./pre-register-users.scss";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    preRegisterTableStatus: state.table.preRegisterTableStatus,
  };
};

class PreRegisterUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false,
      sort_key: "pre_register.id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.startTracking();
    this.getPreRegister();
  }

  componentDidUpdate(prevProps) {
    const { preRegisterTableStatus } = this.props;
    if (!prevProps.preRegisterTableStatus && preRegisterTableStatus) {
      this.reloadTable();
      this.props.dispatch(setPreRegisterTableStatus(false));
    }
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-pr-users-sectionBody");
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
      this.getPreRegister();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getPreRegister(false);
    });
  }

  async clickAction(item) {
    await this.props.dispatch(setPreRegisterActionData(item));
    await this.props.dispatch(setActiveModal("pre-register-action"));
  }

  clickExport = (e) => {
    e.preventDefault();
    const $form = document.getElementById("app-pr-users-page__csvForm");
    // eslint-disable-next-line no-undef
    $form.action = process.env.NEXT_PUBLIC_BACKEND_URL + "api/csv";
    $form.action.value = "pre-register";
    $form.submit();
  };

  getPreRegister(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      users,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    this.props.dispatch(
      getPreRegisterUsersByAdmin(
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
            onClick={() => this.clickHeader("pre_register.created_at")}
          >
            <label className="font-size-14">Date</label>
            {this.renderTriangle("pre_register.created_at")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("pre_register.email")}
          >
            <label className="font-size-14">Email</label>
            {this.renderTriangle("pre_register.email")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("pre_register.first_name")}
          >
            <label className="font-size-14">First Name</label>
            {this.renderTriangle("pre_register.first_name")}
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("pre_register.last_name")}
          >
            <label className="font-size-14">Last Name</label>
            {this.renderTriangle("pre_register.last_name")}
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  renderAction(item) {
    if (item.status == "pending") {
      return (
        <a
          className="btn btn-primary extra-small btn-fluid-small"
          onClick={() => this.clickAction(item)}
        >
          Approve / Deny
        </a>
      );
    } else if (item.status == "completed")
      return <label className="font-size-14">Completed</label>;
    else if (item.status == "denied")
      return <label className="font-size-14 color-danger">Denied</label>;
    else if (item.status == "approved")
      return <label className="font-size-14 color-success">Approved</label>;
    return null;
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
            <div className="c-col-1 c-cols">
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}
                <br />
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">{item.email}</label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">{item.first_name}</label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14">{item.last_name}</label>
            </div>
            <div className="c-col-5 c-cols">{this.renderAction(item)}</div>
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;
    const { loading, search } = this.state;

    return (
      <div id="app-pr-users-page">
        <div id="app-pr-users-page-buttons">
          <form action="" method="POST" id="app-pr-users-page__csvForm">
            <input type="hidden" name="action" value="" />
          </form>
          <a
            className="btn btn-success btn-fluid less-small"
            onClick={this.clickExport}
          >
            Export Pre-Registration
          </a>
        </div>

        <section id="app-pr-users-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>Pre-Registration Data</label>

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
              <div className="infinite-body" id="app-pr-users-sectionBody">
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderUsers()
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PreRegisterUsers);
