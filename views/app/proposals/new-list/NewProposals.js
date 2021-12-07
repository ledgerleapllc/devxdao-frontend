import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import * as Icon from "react-feather";
import Tooltip from "@material-ui/core/Tooltip";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  hideCanvas,
  setActiveModal,
  setAdminActiveProposalTableStatus,
  setAdminPendingProposalTableStatus,
  setCustomModalData,
  setDOSReviewData,
  setEditProposalData,
  setReviewProposal,
  showCanvas,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";
import { approveProposal, getPendingProposals } from "../../../../utils/Thunk";

import "./new-proposals.scss";
import { PROPOSAL_TYPES } from "../../../../utils/enum";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    pendingProposalTableStatus: state.admin.pendingProposalTableStatus,
  };
};

class NewProposals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      proposals: [],
      sort_key: "proposal.id",
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
    const { proposals } = this.state;

    this.getProposals();

    // Start Tracking
    if (proposals && proposals.length) this.startTracking();
  }

  componentDidUpdate(prevProps, prevState) {
    const { pendingProposalTableStatus } = this.props;
    const { proposals } = this.state;

    // Start Tracking
    if (
      (!prevState.proposals || !prevState.proposals.length) &&
      proposals &&
      proposals.length
    )
      this.startTracking();

    // Update Table
    if (!prevProps.pendingProposalTableStatus && pendingProposalTableStatus) {
      this.reloadTable();
      this.props.dispatch(setAdminPendingProposalTableStatus(false));
    }
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-pending-proposals-sectionBody");
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
    };

    this.props.dispatch(
      getPendingProposals(
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

  approve(e, proposal) {
    e.preventDefault();
    if (
      !confirm("Are you sure you are going to approve the selected proposal?")
    )
      return;

    this.props.dispatch(
      approveProposal(
        proposal.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
          this.reloadTable();
          this.props.dispatch(setAdminActiveProposalTableStatus(true));
        }
      )
    );
  }

  deny(e, proposal) {
    e.preventDefault();
    this.props.dispatch(setReviewProposal(proposal));
    this.props.dispatch(setActiveModal("deny-proposal"));
  }

  clickRow(proposal) {
    const { authUser, history } = this.props;
    if (authUser && authUser.is_admin) {
      history.push(`/app/proposal/${proposal.id}`);
    }
  }

  clickWithdraw(e, item) {
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        "confirm-withdraw": {
          render: true,
          title: "Are you sure you want to withdraw this proposal?",
          data: item,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  clickReviewPayment(e, proposal) {
    e.preventDefault();
    this.props.dispatch(setDOSReviewData(proposal));
    this.props.dispatch(setActiveModal("dos-review"));
  }

  clickDenied(e, proposal) {
    e.preventDefault();
    this.props.dispatch(setEditProposalData(proposal));
    this.props.dispatch(setActiveModal("edit-deny"));
  }

  renderTitle(proposal) {
    return proposal.title;
  }

  renderTooltip() {
    return (
      <Fragment>
        <p className="font-size-13">{`This area shows any proposals that are waiting for admin approval or need further action from you. If no action is needed, proposals will disappear from this section and be found below.`}</p>
      </Fragment>
    );
  }

  renderFlag(item) {
    let relationship = item.relationship || "";
    relationship = relationship.split(",");

    if (relationship.includes("0")) return <Icon.Flag />;
    return null;
  }

  renderActions(item) {
    if (item.status == "pending") {
      return (
        <div className="c-action-buttons">
          <a
            className="btn btn-success extra-small"
            onClick={(e) => this.approve(e, item)}
          >
            Approve
          </a>
          <a
            className="btn btn-danger extra-small"
            onClick={(e) => this.deny(e, item)}
          >
            Deny
          </a>
        </div>
      );
    } else if (item.status == "payment" && item.dos_paid) {
      return (
        <div className="c-action-buttons">
          <a
            className="btn btn-info btn-fluid-small extra-small"
            onClick={(e) => this.clickReviewPayment(e, item)}
          >
            Review Payment
          </a>
        </div>
      );
    } else if (!item.dos_paid) {
      return (
        <Fragment>
          <label
            className="font-size-12 color-primary d-block"
            onClick={() => this.clickRow(item)}
          >
            Payment Waiting
          </label>
          <a
            className="btn btn-danger-outline extra-small btn-fluid-small"
            style={{
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              marginTop: "0.5rem",
            }}
            onClick={(e) => this.clickWithdraw(e, item)}
          >
            Force Withdraw
          </a>
        </Fragment>
      );
    }

    return null;
  }

  renderProposals() {
    const { proposals } = this.state;
    const items = [];

    if (!proposals || !proposals.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    proposals.forEach((item, index) => {
      items.push(
        <li key={`proposal_${index}`}>
          <div className="infinite-row">
            <div className="c-col-0 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14 d-block">{item.id}</label>
            </div>
            <div className="c-col-1 c-cols" onClick={() => this.clickRow(item)}>
              <Tooltip title={item.title} placement="bottom">
                <label className="font-size-14 font-weight-700">
                  {item.title}
                </label>
              </Tooltip>
              <p className="font-size-12">
                {Helper.getExcerpt(
                  item.short_description || item.member_reason
                )}
              </p>
            </div>
            <div className="c-col-2 c-cols" onClick={() => this.clickRow(item)}>
              {this.renderFlag(item)}
            </div>
            <div className="c-col-3 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14 text-capitalize">
                {PROPOSAL_TYPES[item.type]}
              </label>
            </div>
            <div className="c-col-4 c-cols" onClick={() => this.clickRow(item)}>
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-5 c-cols">{this.renderActions(item)}</div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
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
            className="c-col-0 c-cols"
            onClick={() => this.clickHeader("proposal.id")}
          >
            <label className="font-size-14">#</label>
            {this.renderTriangle("proposal.id")}
          </div>
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Affiliate</label>
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("proposal.type")}
          >
            <label className="font-size-14">Type</label>
            {this.renderTriangle("proposal.type")}
          </div>
          <div
            className="c-col-4 c-cols"
            onClick={() => this.clickHeader("proposal.created_at")}
          >
            <label className="font-size-14">Date</label>
            {this.renderTriangle("proposal.created_at")}
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loading, search } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id || !authUser.is_admin) return null;

    return (
      <Fade distance={"20px"} bottom duration={200} delay={500}>
        <section
          id="app-pending-proposals-section"
          className="app-infinite-box"
        >
          <div className="app-infinite-search-wrap">
            <label>New Proposals (Admin Only)</label>

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
                id="app-pending-proposals-sectionBody"
              >
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderProposals()
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(NewProposals));
