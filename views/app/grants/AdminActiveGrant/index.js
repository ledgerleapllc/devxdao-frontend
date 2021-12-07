import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  getGrantsShared,
  viewSignedGrant,
  downloadCSVActiveGrants,
} from "../../../../utils/Thunk";
import {
  setActiveModal,
  setCustomModalData,
  setGrantTableStatus,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";

import "./admin-active-grant.scss";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    grantTableStatus: state.table.grantTableStatus,
  };
};

const STATUS = "active";

class AdminActiveGrant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      proposals: [],
      sort_key: "final_grant.id",
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
    const { authUser } = this.props;
    if (authUser && authUser.id) this.startTracking();

    this.getProposals();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { authUser, grantTableStatus } = this.props;

    // Start Tracking
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.startTracking();

    if (!prevProps.grantTableStatus && grantTableStatus) {
      this.reloadTable();
      this.props.dispatch(setGrantTableStatus(false));
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-active-grants-sectionBody");
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

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, proposals: [], finished: false }, () => {
      this.getProposals();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getProposals(false);
    });
  }

  getProposals(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      proposals,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 20,
      status: STATUS,
    };

    this.props.dispatch(
      getGrantsShared(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            proposals: [...proposals, ...result],
          });
        }
      )
    );
  }

  showSignDialog(item) {
    if (
      !item.proposal ||
      !item.signture_grants ||
      !item.signture_grants.length
    ) {
      return null;
    }
    this.props.dispatch(
      setCustomModalData({
        signatures: {
          render: true,
          title: "Grant Agreement Signatures",
          data: item.signture_grants,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  openSignedGrant(item) {
    this.props.dispatch(
      viewSignedGrant(
        item.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            window.open(res.file_url, "_blank").focus();
          }
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  renderSignAgreement(item) {
    return (
      <>
        <button
          className={`w-100 btn extra-small btn-primary btn-fluid-small`}
          onClick={() => this.openSignedGrant(item)}
        >
          View
        </button>
      </>
    );
  }

  renderStatus(item) {
    if (item.status == "pending")
      return <p className="font-size-14 color-primary">Pending</p>;
    else if (item.status == "active")
      return <p className="font-size-14 color-info">Active</p>;
    return <p className="font-size-14 color-success">Completed</p>;
  }

  renderMilestonesComplete(item) {
    return (
      <p
        className={`font-size-14 ${
          +item.milestones_complete === +item.milestones_total
            ? "text-success"
            : ""
        }`}
      >
        {item.milestones_complete}/{item.milestones_total}
      </p>
    );
  }

  clickRow(item) {
    const { history, authUser } = this.props;
    if (authUser.is_admin || authUser.is_member)
      history.push(`/app/proposal/${item.proposal_id}`);
    else if (authUser.is_participant) {
      if (item.user_id == authUser.id) {
        // OP
        history.push(`/app/proposal/${item.proposal_id}`);
      } else {
        // Not OP & Not Vote
        if (!item.votes || !item.votes.length)
          history.push(`/app/proposal/${item.proposal_id}`);
      }
    }
  }

  renderTitle(item) {
    return item.proposal.title;
  }

  renderTriangle(key) {
    const { sort_key, sort_direction } = this.state;
    if (sort_key != key) return <span className="inactive">&#9650;</span>;
    else {
      if (sort_direction == "asc") return <span>&#9650;</span>;
      else return <span>&#9660;</span>;
    }
  }

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

  downloadCSV = () => {
    let { calling, loading, sort_key, sort_direction, search } = this.state;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
      search,
    };

    this.props.dispatch(
      downloadCSVActiveGrants(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "active-grant.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

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

  renderActiveHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">#</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Title</label>
          </div>
          <div className="c-col-3 c-cols">
            <p className="font-size-14 font-weight-700">OP Email</p>
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("final_grant.status")}
          >
            <label className="font-size-14">Status</label>
            {this.renderTriangle("final_grant.status")}
          </div>
          <div
            className="c-col-5 c-cols"
            onClick={() => this.clickHeader("final_grant.created_at")}
          >
            <label className="font-size-14">Start Date</label>
            {this.renderTriangle("final_grant.created_at")}
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">
              Milestones
              <br />
              Complete
            </label>
          </div>
          <div className="c-col-7 c-cols">
            <label className="font-size-14">Grant Agreement</label>
          </div>
        </div>
      </div>
    );
  }

  renderActiveProposals() {
    const { proposals } = this.state;
    const items = [];

    if (!proposals || !proposals.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    proposals.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <p className="font-size-14 font-weight-700">{item.proposal_id}</p>
            </div>
            <div className="c-col-2 c-cols" onClick={() => this.clickRow(item)}>
              <Tooltip title={item.proposal.title} placement="bottom">
                <p className="font-size-14 font-weight-700 text-elipse">
                  {this.renderTitle(item)}
                </p>
              </Tooltip>
            </div>
            <div className="c-col-3 c-cols">
              <p className="font-size-14 font-weight-700">
                <Link
                  className="text-elipse"
                  to={`/app/user/${item.proposal.user_id}`}
                  style={{ color: "inherit" }}
                >
                  {item.user?.email}
                </Link>
              </p>
            </div>
            <div className="c-col-4 c-cols">{this.renderStatus(item)}</div>
            <div className="c-col-5 c-cols">
              <p className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}
                <br />
                {moment(item.created_at).local().format("h:mm A")}
              </p>
            </div>
            <div className="c-col-6 c-cols">
              {this.renderMilestonesComplete(item)}
            </div>
            <div className="c-col-7 c-cols">
              {this.renderSignAgreement(item)}
            </div>
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
      <section
        id="app-grants-section"
        className="app-infinite-box admin admin-active-grant"
      >
        <div className="app-infinite-search-wrap">
          <label>Active Grants</label>
          <div className="d-flex">
            <button
              className="btn btn-primary btn-download extra-small mr-2"
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

        <div className="infinite-content">
          <div className="infinite-contentInner">
            {this.renderActiveHeader()}

            <div className="infinite-body" id="app-active-grants-sectionBody">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderActiveProposals()
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AdminActiveGrant));
