import { Tooltip } from "@material-ui/core";
import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../../../components";
import { getWinners } from "../../../../../../utils/Thunk";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadActiveSurveyTable: state.admin.reloadActiveSurveyTable,
  };
};

class WinnersTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      loading: false,
      data: [],
      sort_key: "rank",
      sort_direction: "asc",
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

    const { params } = this.props;
    if (prevProps.params !== params) {
      this.setState({ params: { ...params } });
      setTimeout(() => this.reloadTable());
    }
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("winners-scroll-track");
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
      page_id,
      data,
      params,
    } = this.state;
    if (loading || calling || finished) return;

    const tempParams = {
      sort_key,
      sort_direction,
      page_id,
      ...params,
    };

    this.props.dispatch(
      getWinners(
        tempParams,
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
            data: [...data, ...result],
          });
        }
      )
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

    data.forEach((item, index) => {
      items.push(
        <li key={`mile_${item.id}_${index}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{moment(item.end_time).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>S{item.survey_id}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.rank}</p>
            </div>
            <div className="c-col-4 c-cols">
              <Link to={`/app/proposal/${item.id}`}>
                <p>{item.id}</p>
              </Link>
            </div>
            <div className="c-col-5 c-cols">
              <Tooltip title={item.title} placement="left">
                <Link to={`/app/proposal/${item.id}`}>
                  <p>S{item.title}</p>
                </Link>
              </Tooltip>
            </div>
            <div className="c-col-6 c-cols">
              <p
                className={
                  item.status.label === "In Discussion"
                    ? "text-danger"
                    : "text-success"
                }
              >
                {item.status.label}
              </p>
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
      <div className="winners-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Survey End</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Survey #</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Spot #</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Proposal #</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Title</label>
              </div>
              <div className="c-col-6 c-cols">
                <label className="font-size-14">Current Status</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="winners-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(WinnersTable);
