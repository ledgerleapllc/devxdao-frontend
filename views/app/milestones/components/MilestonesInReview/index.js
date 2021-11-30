import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import Helper from "../../../../../utils/Helper";
import { getAllReviewMilestones } from "../../../../../utils/Thunk";
import "./milestones-in-review.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class MilestonesInReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
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
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("milestone-in-review-scroll-track");
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
      limit: 20,
    };

    this.props.dispatch(
      getAllReviewMilestones(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.milestoneReviews || [];
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

  renderMilestoneIndex(item) {
    const idx = item.milestones.findIndex((x) => x.id === item.milestone_id);
    return idx + 1;
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
        <li key={`mile_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>
                {item.proposal_id}-{this.renderMilestoneIndex(item)}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{moment(item.submitted_time).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.time_submit}</p>
            </div>
            <div className="c-col-4 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-5 c-cols">
              <p>{item.proposal_id}</p>
            </div>
            <div className="c-col-6 c-cols">
              <p>{item.proposal_title}</p>
            </div>
            <div className="c-col-7 c-cols">
              <p className="pl-3">
                {this.renderMilestoneIndex(item)}/{item.milestones.length}
              </p>
            </div>
            <div className="c-col-8 c-cols">
              <p>{Helper.formatPriceNumber(item.grant || "", "€")}</p>
            </div>
            <div className="c-col-9 c-cols">
              <p>
                {item.milestone_review_status === "pending" && "Unassigned"}
                {item.milestone_review_status === "active" && "Assigned"}
                {item.milestone_review_status === "denied" && "Needs Review"}
              </p>
              {/* <Link
                to={`/app/milestones/${item.milestone_id}/review`}
                className="btn btn-primary extra-small btn-fluid-small"
              >
                Review
              </Link> */}
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
      <div className="milestones-in-review-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Milestone number</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Submitted date</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Times submitted</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">OP email</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Prop #</label>
              </div>
              <div className="c-col-6 c-cols">
                <label className="font-size-14">Proposal title</label>
              </div>
              <div className="c-col-7 c-cols">
                <label className="font-size-14">Milestone</label>
              </div>
              <div className="c-col-8 c-cols">
                <label className="font-size-14">Euro value</label>
              </div>
              <div className="c-col-9 c-cols">
                <label className="font-size-14">PM Review Status</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="milestone-in-review-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(MilestonesInReview);
