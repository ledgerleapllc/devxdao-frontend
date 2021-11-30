import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import DataTable from "react-data-table-component";
import { getUsersByAdmin } from "../../../utils/Thunk";
import { setActiveModal, setReviewUser } from "../../../redux/actions";

import "./dashboard.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    userTableStatus: state.admin.userTableStatus,
  };
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      page_id: 1,
      total: 0,
      loading: false,
      perPage: 50,
      sort_key: "users.email",
      sort_direction: "asc",
    };

    this.columns = [];
  }

  componentDidMount() {
    this.columns = [
      {
        name: "Email",
        selector: "users.email",
        cell: (row) => {
          return <b>{row.email}</b>;
        },
        sortable: true,
        compact: true,
        center: false,
      },
      {
        name: "Alias",
        selector: "users.first_name",
        cell: (row) => {
          return row.first_name + " " + row.last_name;
        },
        sortable: true,
        compact: true,
        center: false,
      },
      {
        name: "Status",
        selector: "users.status",
        cell: (row) => {
          if (row.status == "approved")
            return <label className="user-status approved">Active</label>;
          else if (row.status == "pending")
            return (
              <label
                className="user-status pending"
                onClick={() => this.reviewUser(row)}
              >
                Review
              </label>
            );
          else if (row.status == "rejected")
            return <label className="user-status rejected">Banned</label>;
          return null;
        },
        sortable: true,
        compact: true,
        center: false,
      },
      {
        name: "OP#",
        selector: "users.id",
        cell: (row) => {
          return row.id;
        },
        sortable: true,
        compact: true,
        center: false,
      },
      {
        name: "Registered Date",
        selector: "users.created_at",
        cell: (row) => {
          return (
            <div>
              {moment(row.created_at).local().format("M/D/YYYY")}{" "}
              {moment(row.created_at).local().format("h:mm A")}
            </div>
          );
        },
        sortable: true,
        compact: true,
        center: false,
      },
    ];

    this.getUsers();
  }

  componentDidUpdate(prevProps) {
    const { userTableStatus } = this.props;
    if (!prevProps.userTableStatus && userTableStatus) this.handlePageChange(1);
  }

  getUsers() {
    const { page_id, loading, perPage, sort_key, sort_direction } = this.state;

    if (loading) return;

    const params = {
      page_id,
      page_length: perPage,
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      getUsersByAdmin(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          let users = [];
          let total = 0;
          if (res && res.success) {
            users = res.users || [];
            total = res.total || 0;
          }

          this.setState({ loading: false, users, total });
        }
      )
    );
  }

  reviewUser(row) {
    if (row.status != "pending") return;

    this.props.dispatch(setActiveModal("user-review-modal"));
    this.props.dispatch(setReviewUser(row));
  }

  handleSort = (column, direction) => {
    this.setState(
      { page_id: 1, sort_key: column.selector, sort_direction: direction },
      () => {
        this.getUsers();
      }
    );
  };

  handlePerRowsChange = (perPage) => {
    this.setState({ page_id: 1, perPage }, () => {
      this.getUsers();
    });
  };

  handlePageChange = (page_id) => {
    this.setState({ page_id }, () => {
      this.getUsers();
    });
  };

  render() {
    const { users, loading, total, perPage } = this.state;
    return (
      <div id="dashboard-main-page">
        <label>
          Users Table&nbsp;&nbsp;
          <Icon.Info size={16} color="#724DA7" />
        </label>

        <div className="table-wrapper">
          <DataTable
            columns={this.columns}
            data={users}
            sortServer={true}
            onSort={this.handleSort}
            progressPending={loading}
            persistTableHead
            responsive
            noHeader
            pagination
            paginationServer
            onChangeRowsPerPage={this.handlePerRowsChange}
            onChangePage={this.handlePageChange}
            paginationTotalRows={total}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
