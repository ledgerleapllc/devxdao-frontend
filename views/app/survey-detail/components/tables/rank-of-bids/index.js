import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../../../components";
import {
  forceReloadActiveSurveyTable,
  setActiveModal,
} from "../../../../../../redux/actions";
import Helper from "../../../../../../utils/Helper";
import { getSurveyDetail } from "../../../../../../utils/Thunk";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadActiveSurveyTable: state.admin.reloadActiveSurveyTable,
  };
};

class RankOfBidsTable extends Component {
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
    this.$elem = document.getElementById("bid-scroll-track");
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
    let { calling, loading, finished, data } = this.state;
    if (loading || calling || finished) return;

    this.props.dispatch(
      getSurveyDetail(
        this.props.surveyId,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.survey?.survey_rfp_ranks || [];
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

  doCancel = (id) => {
    this.props.dispatch(setActiveModal("cancel-active-survey", { id }));
  };

  renderHours = (survey) => {
    const duration = moment.duration(
      moment(survey.end_date).diff(moment(survey.start_date))
    );
    const hours = Math.floor(duration.asHours());
    return hours;
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
                <p>{item.rank}</p>
              </Link>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.bid}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.survey_rfp_bid?.forum}</p>
            </div>
            <div className="c-col-4 c-cols">
              <p>
                {Helper.formatPriceNumber(
                  item.survey_rfp_bid?.amount_of_bid || "",
                  "€"
                )}
              </p>
            </div>
            <div className="c-col-5 c-cols">
              <p>
                {moment(item.delivery_date).local().format("M/D/YYYY HH:mm A")}
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
      <div className="bid-ranks-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Final Rank</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Bid #</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Forum name</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Price</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Delivery date</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="bid-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(RankOfBidsTable);
