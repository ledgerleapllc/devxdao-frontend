import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { downloadCSVUsers, getUsersByAdmin } from "../../../../utils/Thunk";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  hideCanvas,
  setAdminUserTableStatus,
  showCanvas,
} from "../../../../redux/actions";
import { withRouter } from "react-router-dom";
import { Checkbox } from "../../../../components";

import "./users.scss";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import { DECIMALS } from "../../../../utils/Constant";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    userTableStatus: state.admin.userTableStatus,
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
      is_va: null,
      filter_v: false,
      start_date: "",
      end_date: "",
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    this.startTracking();
    this.getUsers();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { userTableStatus } = this.props;
    if (!prevProps.userTableStatus && userTableStatus) {
      this.reloadTable();
      this.props.dispatch(setAdminUserTableStatus(false));
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-users-sectionBody");
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
      is_va,
      filter_v,
      start_date,
      end_date,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
    };

    if (is_va) params.is_va = is_va;
    if (filter_v) {
      params.start_date = start_date;
      params.end_date = end_date;
    }

    this.props.dispatch(
      getUsersByAdmin(
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

  changeVA(val) {
    this.setState({ is_va: val ? 1 : 0 }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.reloadTable();
      }, 500);
    });
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

  filterV = (val) => {
    const temp = { filter_v: val };
    if (!val) {
      temp.start_date = null;
      temp.end_date = null;
      this.reloadTable();
    }
    this.setState(temp);
    this.setState(temp, () => {
      if (!val) {
        this.reloadTable();
      }
    });
  };

  recalculate = () => {
    this.reloadTable();
  };

  downloadCSV = () => {
    let {
      calling,
      loading,
      sort_key,
      sort_direction,
      search,
      is_va,
      filter_v,
      start_date,
      end_date,
    } = this.state;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
      search,
    };

    if (is_va) params.is_va = is_va;
    if (filter_v) {
      params.start_date = start_date;
      params.end_date = end_date;
    }

    this.props.dispatch(
      downloadCSVUsers(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "portal-users.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
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
            onClick={() => this.clickHeader("users.id")}
          >
            <label className="font-size-14">User ID</label>
            {this.renderTriangle("users.id")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("users.email")}
          >
            <label className="font-size-14">Email</label>
            {this.renderTriangle("users.email")}
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Telegram</label>
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("users.first_name")}
          >
            <label className="font-size-14">First Name</label>
            {this.renderTriangle("users.first_name")}
          </div>
          <div
            className="c-col-5 c-cols"
            onClick={() => this.clickHeader("users.last_name")}
          >
            <label className="font-size-14">Last Name</label>
            {this.renderTriangle("users.last_name")}
          </div>
          <div
            className="c-col-6 c-cols"
            onClick={() => this.clickHeader("users.forum_name")}
          >
            <label className="font-size-14">Forum Name</label>
            {this.renderTriangle("users.forum_name")}
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">V%</label>
          </div>
          <div className="c-col-8 c-cols">
            <label className="font-size-14">Total Rep</label>
          </div>
          <div className="c-col-9 c-cols">
            <label className="font-size-14">User Type</label>
          </div>
          <div className="c-col-10 c-cols">
            <label className="font-size-14">Action</label>
          </div>
          <div
            className="c-col-11 c-cols"
            onClick={() => this.clickHeader("users.created_at")}
          >
            <label className="font-size-14">Registered Date</label>
            {this.renderTriangle("users.created_at")}
          </div>
        </div>
      </div>
    );
  }

  renderUserType(user) {
    if (user.is_member) return "Voting Associate";
    else if (user.is_participant) return "Associate";
    else if (user.is_proposer) return "Proposer";
    else if (user.is_guest) return "Guest";
    return "";
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
        <li key={`user_${index}`} onClick={() => this.clickRow(item)}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">
                <b>{item.id}</b>
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">
                <b>{item.email}</b>
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14 text-elipse">
                {item.telegram}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14">{item.first_name}</label>
            </div>
            <div className="c-col-5 c-cols">
              <label className="font-size-14">{item.last_name}</label>
            </div>
            <div className="c-col-6 c-cols">
              <label className="font-size-14">{item.forum_name}</label>
            </div>
            <div className="c-col-7 c-cols">
              <label className="font-size-14">
                {this.renderUserType(item) === "Voting Associate" && (
                  <>
                    {item.total_voted && item.total_informal_votes
                      ? (
                          (item.total_voted / item.total_informal_votes) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </>
                )}
              </label>
            </div>
            <div className="c-col-8 c-cols">
              <label className="font-size-14">
                {item.total_rep.toFixed?.(DECIMALS)}
              </label>
            </div>
            <div className="c-col-9 c-cols">
              <label className="font-size-14">
                {this.renderUserType(item)}
              </label>
            </div>
            <div className="c-col-10 c-cols">
              <a className="btn btn-primary extra-small">View</a>
            </div>
            <div className="c-col-11 c-cols">
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
    const { loading, search, filter_v, end_date, start_date } = this.state;
    return (
      <section id="app-users-section" className="app-infinite-box">
        <div className="align-items-start flex-column app-infinite-search-wrap">
          <label>
            Users Table&nbsp;&nbsp;
            <Icon.Info size={16} />
          </label>
          <div className="pt-4 align-items-center d-flex w-100">
            <div className="align-items-end tool-box d-flex tool-1">
              <Checkbox
                text="Filter V%"
                value={filter_v}
                onChange={(val) => this.filterV(val)}
              />
              {filter_v && (
                <>
                  <div className="d-flex flex-column">
                    <label className="pb-2">Start date</label>
                    <DatePicker
                      format="M/d/yyyy"
                      value={start_date ? new Date(start_date) : null}
                      onChange={(val) =>
                        this.setState({
                          start_date: val
                            ? moment(val).local().format("YYYY-MM-DD")
                            : null,
                        })
                      }
                      onCalendarClose={() => {}}
                      calendarIcon={""}
                      clearIcon={""}
                    />
                  </div>
                  <div className="d-flex flex-column">
                    <label className="pb-2">End date</label>
                    <DatePicker
                      format="M/d/yyyy"
                      value={end_date ? new Date(end_date) : null}
                      onChange={(val) =>
                        this.setState({
                          end_date: val
                            ? moment(val).local().format("YYYY-MM-DD")
                            : null,
                        })
                      }
                      onCalendarClose={() => {}}
                      calendarIcon={""}
                      clearIcon={""}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-download extra-small"
                    onClick={() => this.recalculate()}
                  >
                    Recalculate
                  </button>
                </>
              )}
            </div>
            <div className="tool-box d-flex tool-2 justify-content-end align-items-end h-100">
              <Checkbox
                text="Show only VAs"
                onChange={(val) => this.changeVA(val)}
              />
              <button
                className="btn btn-primary btn-download extra-small"
                onClick={() => this.downloadCSV()}
              >
                Download CSV
              </button>
              <input
                type="text"
                value={search}
                onChange={this.handleSearch}
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        <div className="infinite-content">
          <div className="infinite-contentInner">
            {this.renderHeader()}
            <div className="infinite-body" id="app-users-sectionBody">
              {loading ? <GlobalRelativeCanvasComponent /> : this.renderUsers()}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Users));
