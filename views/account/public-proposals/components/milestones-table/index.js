import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import Helper from "../../../../../utils/Helper";
import { getAllPublicMilestonesShared } from "../../../../../utils/Thunk";
import "./milestones-table.scss";
import { withRouter } from "react-router-dom";

const mapStateToProps = () => {
  return {};
};

class PublicMilestonesTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeLoad: true,
      loading: false,
      data: [],
      sort_key: "proposal.id",
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
    this.getData();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;
    if (prevProps.params !== params) {
      this.setState({ params: { ...params } });
      setTimeout(() => this.reloadTable());
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("public-milestones-scroll-track");
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
      firstTimeLoad,
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
      getAllPublicMilestonesShared(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.milestones || [];
          const finished = res.finished || false;
          this.setState({
            firstTimeLoad: false,
            loading: false,
            calling: false,
            finished,
            data: [...data, ...result],
          });
          if (firstTimeLoad) {
            setTimeout(() => this.startTracking());
          }
        }
      )
    );
  }

  renderVoteResult(item) {
    const vote = item.votes[item.votes.length - 1];
    if (vote && vote.status === "completed") {
      if (vote.result_count && vote.result == "success")
        return (
          <label className="font-size-14 color-success d-block">Pass</label>
        );
      else if (vote.result == "no-quorum")
        return (
          <label className="font-size-14 color-danger d-block">No Quorum</label>
        );
      return <label className="font-size-14 color-danger d-block">Fail</label>;
    }
    return null;
  }

  renderMilestoneIndex(item) {
    const idx = item.milestones.findIndex((x) => x.id === item.id);
    return idx + 1;
  }

  gotoDetail = (item) => {
    const { history } = this.props;
    history.push(`/public-milestones/${item.id}`);
  };

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
          <div
            className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700"
            onClick={() => this.gotoDetail(item)}
          >
            <div className="c-col-1 c-cols">
              <p>
                {item.proposal_id}-{this.renderMilestoneIndex(item)}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.submitted_time ? "Submitted" : "Not submitted"}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-4 c-cols">
              <p>{item.proposal_id}</p>
            </div>
            <div className="c-col-5 c-cols">
              <p>{item.proposal_title}</p>
            </div>
            <div className="c-col-6 c-cols">
              <p className="pl-3">
                {this.renderMilestoneIndex(item)}/{item.milestones.length}
              </p>
            </div>
            <div className="c-col-7 c-cols">
              <p>{Helper.formatPriceNumber(item.grant || "", "€")}</p>
            </div>
            <div className="c-col-8 c-cols">
              <p>
                {item.deadline
                  ? moment(item.deadline).local().format("M/D/YYYY")
                  : ""}
              </p>
            </div>
            <div className="c-col-9 c-cols">
              <p>
                {item.submitted_time
                  ? moment(item.submitted_time).local().format("M/D/YYYY")
                  : ""}
              </p>
            </div>
            <div className="c-col-10 c-cols">{this.renderVoteResult(item)}</div>
            <div className="c-col-11 c-cols">
              <p>{item.paid ? "Yes" : "No"}</p>
            </div>
            <div className="c-col-12 c-cols">
              <p>
                {item.paid_time
                  ? moment(item.paid_time).local().format("M/D/YYYY")
                  : ""}
              </p>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

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

  render() {
    const { loading, search } = this.state;
    return (
      <div className="public-milestones-table">
        <div className="app-infinite-search-wrap">
          <label>All Milestones</label>

          <input
            type="text"
            value={search}
            onChange={this.handleSearch}
            placeholder="Search..."
          />
        </div>

        <div className="infinite-content">
          <div className="infinite-contentInner">
            <div className="infinite-header">
              <div className="infinite-headerInner">
                <div className="c-col-1 c-cols">
                  <label className="font-size-14">Milestone number</label>
                </div>
                <div className="c-col-2 c-cols">
                  <label className="font-size-14">Status</label>
                </div>
                <div className="c-col-3 c-cols">
                  <label className="font-size-14">OP email</label>
                </div>
                <div className="c-col-4 c-cols">
                  <label className="font-size-14">Prop #</label>
                </div>
                <div className="c-col-5 c-cols">
                  <label className="font-size-14">Proposal title</label>
                </div>
                <div className="c-col-6 c-cols">
                  <label className="font-size-14">Milestone</label>
                </div>
                <div className="c-col-7 c-cols">
                  <label className="font-size-14">Euro value</label>
                </div>
                <div className="c-col-8 c-cols">
                  <label className="font-size-14">Due date</label>
                </div>
                <div className="c-col-9 c-cols">
                  <label className="font-size-14">Submitted date</label>
                </div>
                <div className="c-col-10 c-cols">
                  <label className="font-size-14">Vote result</label>
                </div>
                <div className="c-col-11 c-cols">
                  <label className="font-size-14">Paid?</label>
                </div>
                <div className="c-col-12 c-cols">
                  <label className="font-size-14">Paid Date</label>
                </div>
              </div>
            </div>
            <div className="infinite-body" id="public-milestones-scroll-track">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderResult()
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PublicMilestonesTable));
