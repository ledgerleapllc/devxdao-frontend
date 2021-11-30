import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { getMilestoneLogs } from "../../../../../utils/Thunk";
import "./activity-logs.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ActivityLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      sort_key: "",
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
    this.$elem = document.getElementById("logs-scroll-track");
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
      getMilestoneLogs(
        this.props.id,
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.milestoneLogs || [];
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
    return (
      <p className="pl-3">
        {idx + 1}/{item.milestones.length}
      </p>
    );
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
        <li className="w-100" key={`mile_${item.id}`}>
          <div className="w-100 infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{moment(item.created_at).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.action}</p>
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
      <div className="activity-logs-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Date and time</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">User</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Action</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="logs-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ActivityLogs);
