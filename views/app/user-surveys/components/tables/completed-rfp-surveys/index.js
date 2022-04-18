import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../../../components";
import { forceReloadActiveSurveyTable } from "../../../../../../redux/actions";
import { DEFAULT_API_RECORDS } from "../../../../../../utils/Constant";
import { getUserSurveys } from "../../../../../../utils/Thunk";

import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadActiveSurveyTable: state.admin.reloadActiveSurveyTable,
  };
};

class CompletedRFPSurveysTable extends Component {
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

    if (
      this.props.reloadActiveSurveyTable &&
      this.props.reloadActiveSurveyTable !== prevProps.reloadActiveSurveyTable
    ) {
      this.props.dispatch(forceReloadActiveSurveyTable(false));
      this.reloadTable();
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
    this.$elem = document.getElementById("completed-rfp-scroll-track");
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
      limit: DEFAULT_API_RECORDS,
      type: "rfp",
      status: "completed",
    };

    this.props.dispatch(
      getUserSurveys(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.surveys || [];
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

  gotoSurveyDetail(item) {
    const { history } = this.props;
    history.push(`/app/user-surveys/${item.id}`);
  }

  viewResults = (id) => {
    const { history } = this.props;
    history.push(`/app/surveys/${id}`);
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
        <li key={`mile_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <Link to={`/app/surveys/${item.id}`}>
                <p>RFP{item.id}</p>
              </Link>
            </div>
            <div className="c-col-2 c-cols">
              <button
                className="btn btn-primary extra-small btn-fluid-small"
                onClick={() => this.gotoSurveyDetail(item)}
              >
                View
              </button>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.job_title}</p>
            </div>
            <div className="c-col-4 c-cols">
              <p>
                {moment(item.created_at).local().format("M/D/YYYY HH:mm A")}
              </p>
            </div>
            <div className="c-col-5 c-cols">
              <p>{moment(item.end_time).local().format("M/D/YYYY HH:mm A")}</p>
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
      <div className="completed-rfp-surveys-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Survey #</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Status</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">RFP title</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Start date and time</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">End date and time</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="completed-rfp-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CompletedRFPSurveysTable));
