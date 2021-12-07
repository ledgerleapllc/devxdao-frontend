import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import { Checkbox, GlobalRelativeCanvasComponent } from "../../../components";
import {
  getReputationTrack,
  downloadCSVMyRep,
  postRepDailyCsv,
} from "../../../utils/Thunk";
import "./reputation.scss";
import { DECIMALS } from "../../../utils/Constant";
import { hideCanvas, showCanvas } from "../../../redux/actions";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Reputation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
      sort_key: "reputation.updated_at",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      total: "",
      daily_email: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.startTracking();
    this.setState({ daily_email: authUser.notice_send_repatution });

    this.getReputation();
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
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-reputation-sectionBody");
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

  downloadCSV = () => {
    this.props.dispatch(
      downloadCSVMyRep(
        { search: this.state.search },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "my-rep.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
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
    this.setState({ page_id: 1, items: [], finished: false }, () => {
      this.getReputation();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getReputation(false);
    });
  }

  getReputation(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      items,
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
      getReputationTrack(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.items || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            items: [...items, ...result],
            total: res.total,
          });
        }
      )
    );
  }

  renderTitle(item) {
    if (!item.proposal_id) return "-";
    return item.proposal_title;
  }

  // Render Value
  renderValue(item) {
    const value = parseFloat(item.value);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed?.(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed?.(DECIMALS)}
        </label>
      );
    return "";
  }

  // Render Staked
  renderStaked(item) {
    const value = parseFloat(item.staked);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed?.(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed?.(DECIMALS)}
        </label>
      );
    return "";
  }

  // Render Pending
  renderPending(item) {
    const value = parseFloat(item.pending);

    if (value > 0)
      return (
        <label className="font-size-14 color-success">
          +{value?.toFixed?.(DECIMALS)}
        </label>
      );
    else if (value < 0)
      return (
        <label className="font-size-14 color-danger">
          {value?.toFixed?.(DECIMALS)}
        </label>
      );
    return "";
  }

  renderItems() {
    const { items } = this.state;
    const renderItems = [];

    if (!items || !items.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    items.forEach((item) => {
      renderItems.push(
        <li key={`reputation_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">{item.event}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14 font-weight-700">
                {this.renderTitle(item)}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">{item.type}</label>
            </div>
            <div className="c-col-4 c-cols">{this.renderValue(item)}</div>
            <div className="c-col-5 c-cols">{this.renderStaked(item)}</div>
            <div className="c-col-6 c-cols">{this.renderPending(item)}</div>
            <div className="c-col-7 c-cols">
              <label className="font-size-14">
                {moment(item.updated_at).local().format("M/D/YYYY")}{" "}
                {moment(item.updated_at).local().format("h:mm A")}
              </label>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{renderItems}</ul>;
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

  toggleDailyEmail(e) {
    const value = e ? 1 : 0;
    this.setState({ daily_email: value });
    this.props.dispatch(
      postRepDailyCsv(
        { setting: value },
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div
            className="c-col-1 c-cols"
            onClick={() => this.clickHeader("reputation.event")}
          >
            <label className="font-size-14">Event</label>
            {this.renderTriangle("reputation.event")}
          </div>
          <div
            className="c-col-2 c-cols"
            onClick={() => this.clickHeader("proposal.title")}
          >
            <label className="font-size-14">Title</label>
            {this.renderTriangle("proposal.title")}
          </div>
          <div
            className="c-col-3 c-cols"
            onClick={() => this.clickHeader("reputation.type")}
          >
            <label className="font-size-14">Transaction Type</label>
            {this.renderTriangle("reputation.type")}
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Earned/Returned/Lost</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Staked</label>
          </div>
          <div className="c-col-6 c-cols">
            <label className="font-size-14">Pending</label>
          </div>
          <div
            className="c-col-7 c-cols"
            onClick={() => this.clickHeader("reputation.updated_at")}
          >
            <label className="font-size-14">Date</label>
            {this.renderTriangle("reputation.updated_at")}
          </div>
        </div>
      </div>
    );
  }

  renderTotal() {
    const { total } = this.state;
    const { authUser } = this.props;

    let totalV = parseFloat(total) + parseFloat(authUser.profile.rep);

    return totalV?.toFixed?.(DECIMALS);
  }

  render() {
    const { loading, search, total } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-reputation-page">
        <div className="d-flex justify-content-between">
          <h3>
            My Available Reputation: <Icon.Droplet />{" "}
            <span>{authUser.profile.rep?.toFixed?.(DECIMALS)}</span>
          </h3>
          <Checkbox
            value={this.state.daily_email}
            onChange={(e) => this.toggleDailyEmail(e)}
            text="Daily CSV email"
          />
        </div>
        <label className="d-block mb-0">
          Total: <span>{this.renderTotal()}</span>
        </label>
        <label className="d-block mb-0">
          Staked: <span>{total?.toFixed?.(DECIMALS)}</span>
        </label>
        <label className="d-block">
          Minted Pending:
          <span>{authUser.profile.rep_pending?.toFixed?.(DECIMALS)}</span>
        </label>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section id="app-reputation-section" className="app-infinite-box">
            <div className="app-infinite-search-wrap">
              <label>Reputation Tracking</label>
              <div>
                <button
                  className="btn btn-primary btn-download extra-small mr-2"
                  onClick={() => this.downloadCSV()}
                >
                  Download
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
                {this.renderHeader()}

                <div className="infinite-body" id="app-reputation-sectionBody">
                  {loading ? (
                    <GlobalRelativeCanvasComponent />
                  ) : (
                    this.renderItems()
                  )}
                </div>
              </div>
            </div>
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Reputation));
