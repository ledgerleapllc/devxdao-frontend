import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  getGrantsShared,
  beginGrant,
  remindHellosignGrant,
  resendHellosignGrant,
} from "../../../../utils/Thunk";
import {
  hideCanvas,
  setActiveModal,
  setCustomModalData,
  setGrantTableStatus,
  showAlert,
  showCanvas,
} from "../../../../redux/actions";

import "./admin-pending-grant.scss";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-ui/core";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    grantTableStatus: state.table.grantTableStatus,
  };
};

const TOTAL_SIGN_COUNT = 3;
const STATUS = "pending";

class AdminPendingGrant extends Component {
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
    this.$elem = document.getElementById("app-grants-sectionBody");
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

  clickActivate(item) {
    this.props.dispatch(
      setCustomModalData({
        "activate-grant": {
          render: true,
          title:
            "Please upload the grant document with the association President's signature approving and activating this grant.",
          data: item,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
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
          data: item,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  clickBeginGrant(item) {
    const signedCount = +item.signture_grants.filter((x) => x.signed).length;
    if (signedCount === TOTAL_SIGN_COUNT) {
      this.props.dispatch(
        beginGrant(
          item.id,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res && res.success) {
              this.props.dispatch(setGrantTableStatus(true));
            }
          }
        )
      );
    }
  }

  renderGrantAction(item) {
    const signedCount = +item.signture_grants.filter((x) => x.signed).length;
    return (
      <div className="d-flex align-items-center flex-column">
        <button
          className={`w-100 btn extra-small btn-primary btn-fluid-small`}
          onClick={() => this.clickBeginGrant(item)}
          disabled={signedCount < TOTAL_SIGN_COUNT}
        >
          Activate
        </button>
        {item.status == "pending" && (
          <a
            className="mt-2 font-size-12 text-underline"
            onClick={() => this.clickActivate(item)}
            style={{ color: "inherit" }}
          >
            Force Activation
          </a>
        )}
      </div>
    );
  }

  renderStatus(item) {
    if (item.status == "pending")
      return <p className="font-size-14 color-primary">Pending</p>;
    else if (item.status == "active")
      return <p className="font-size-14 color-info">Active</p>;
    return <p className="font-size-14 color-success">Completed</p>;
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

  remind(grant) {
    this.props.dispatch(
      remindHellosignGrant(
        grant.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            this.props.dispatch(showAlert(`Remind successfully`, "success"));
            this.reloadTable();
          }
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  resend(grant) {
    this.props.dispatch(
      resendHellosignGrant(
        grant.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            const { proposals } = this.state;
            const ind = proposals.findIndex((x) => x.id === grant.id);
            proposals[ind].signture_grants = grant.signture_grants.map(
              (x) => x.signed === 0
            );

            this.setState({
              ...this.state,
              proposals: [...proposals],
            });
            this.props.dispatch(showAlert(`Resend successfully`, "success"));
            this.reloadTable();
          }
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  renderSignAgreement(item) {
    const signedCount = +item.signture_grants.filter((x) => x.signed).length;
    return (
      <>
        <a onClick={() => this.showSignDialog(item)}>
          {signedCount}/{TOTAL_SIGN_COUNT}
        </a>
        <a
          className="mt-2 d-block font-size-14 text-underline"
          onClick={() => this.remind(item)}
          style={{ color: "inherit" }}
        >
          Remind
        </a>
        <a
          className="mt-2 d-block font-size-14 text-underline"
          onClick={() => this.resend(item)}
          style={{ color: "inherit" }}
        >
          Resend
        </a>
      </>
    );
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

  renderPendingHeader() {
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
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Signatures</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  renderPendingProposals() {
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
              {this.renderSignAgreement(item)}
            </div>
            <div className="c-col-6 c-cols">{this.renderGrantAction(item)}</div>
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
        className="app-infinite-box admin admin-pending-grant"
      >
        <div className="app-infinite-search-wrap">
          <label>Grants Pending Activation</label>
          <input
            type="text"
            value={search}
            onChange={this.handleSearch}
            placeholder="Search..."
          />
        </div>

        <div className="infinite-content">
          <div className="infinite-contentInner">
            {this.renderPendingHeader()}

            <div className="infinite-body" id="app-grants-sectionBody">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderPendingProposals()
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AdminPendingGrant));
