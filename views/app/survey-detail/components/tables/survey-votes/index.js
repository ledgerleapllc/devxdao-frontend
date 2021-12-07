import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../../components";
import { withRouter } from "react-router-dom";
import {
  getSurveyVotes,
  downloadCurrentVoteByProposal,
} from "../../../../../../utils/Thunk";
import "./style.scss";
import { Link } from "react-router-dom";
import {
  hideCanvas,
  setActiveModal,
  showCanvas,
} from "../../../../../../redux/actions";
import Helper from "../../../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

const TOTAL_REMAIN_WIDTH = 55;

class SurveyVotesTable extends Component {
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

  openFullPageView() {
    const { history } = this.props;
    history.push(`/app/surveys/${this.props.id}/full-page?status=upvoted`);
  }

  startTracking() {
    this.$elem = document.getElementById("current-votes-scroll-track");
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (!this.$elem) return;
    if (
      this.$elem.scrollTop + this.$elem.clientHeight >=
      this.$elem.scrollHeight - 100
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
      limit: 10,
    };

    this.props.dispatch(
      getSurveyVotes(
        this.props.id,
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
            data: [...data, ...result],
          });
        }
      )
    );
  }

  openListSurveyVotersModal = (value, proposal_id, place_choice) => {
    if (!value) return;
    this.props.dispatch(
      setActiveModal("list-survey-voters", {
        surveyId: this.props.id,
        proposal_id,
        place_choice,
      })
    );
  };

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  downloadCSV() {
    this.props.dispatch(
      downloadCurrentVoteByProposal(
        this.props.id,
        { search: this.state.search },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "upvote-survey.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
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

  renderResult() {
    const { data } = this.state;
    const { cols } = this.props;
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
              <Link to={`/app/proposal/${item.id}`}>
                <p>{item.id}</p>
              </Link>
            </div>
            <div className="c-col-2 c-cols">
              <p>{moment(item.created_at).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.title}</p>
            </div>
            <div
              className="c-col-custom c-cols text-center"
              style={{ width: `calc(${TOTAL_REMAIN_WIDTH}% / ${cols + 1})` }}
            >
              <a
                className="px-3"
                onClick={() =>
                  this.openListSurveyVotersModal(item.total_vote, item.id)
                }
              >
                {item.total_vote}
              </a>
            </div>
            {Array(cols)
              .fill(1)
              .map((x, i) => (
                <div
                  key={i}
                  className="c-col-custom c-cols text-center"
                  style={{
                    width: `calc(${TOTAL_REMAIN_WIDTH}% / ${cols + 1})`,
                  }}
                >
                  <a
                    className="px-3"
                    onClick={() =>
                      this.openListSurveyVotersModal(
                        item[`${i + 1}_place`],
                        item.id,
                        1
                      )
                    }
                  >
                    {item[`${i + 1}_place`]}
                  </a>
                </div>
              ))}
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { loading, search } = this.state;
    const { cols, removeFullPageButton } = this.props;
    return (
      <>
        <div className="app-infinite-search-wrap">
          <div className="d-flex align-items-center">
            <h4 className="pr-2">Current votes by proposal</h4>
            {!removeFullPageButton && (
              <button
                className="mr-4 btn btn-primary btn-download small ml-2"
                onClick={() => this.openFullPageView()}
              >
                Full Page View
              </button>
            )}
          </div>
          <div className="d-flex">
            <button
              className="mr-4 btn btn-primary btn-download small ml-2"
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
        <div
          className={`survey-votes-table infinite-content ${
            this.props.hideWonColumn ? "hide-won-column" : ""
          }`}
        >
          <div className="infinite-contentInner">
            <div className="infinite-header">
              <div className="infinite-headerInner">
                <div className="c-col-1 c-cols">
                  <label className="font-size-14">Proposal number</label>
                </div>
                <div className="c-col-2 c-cols">
                  <label className="font-size-14">
                    Date discussion started
                  </label>
                </div>
                <div className="c-col-3 c-cols">
                  <label className="font-size-14">Proposal title</label>
                </div>
                <div
                  className="c-col-custom c-cols"
                  style={{
                    width: `calc(${TOTAL_REMAIN_WIDTH}% / ${cols + 1})`,
                  }}
                  onClick={() => this.clickHeader("total_vote")}
                >
                  <label className="font-size-14">Total votes</label>
                  {this.renderTriangle("total_vote")}
                </div>
                {Array(cols)
                  .fill(1)
                  .map((x, i) => (
                    <div
                      key={i}
                      className="c-col-custom c-cols"
                      style={{
                        width: `calc(${TOTAL_REMAIN_WIDTH}% / ${cols + 1})`,
                      }}
                      onClick={() => this.clickHeader(`${i + 1}_place`)}
                    >
                      <label className="font-size-14">
                        {Helper.ordinalSuffixOf(i + 1)} place
                      </label>
                      {this.renderTriangle(`${i + 1}_place`)}
                    </div>
                  ))}
              </div>
            </div>
            <div className="infinite-body" id="current-votes-scroll-track">
              {loading ? (
                <GlobalRelativeCanvasComponent />
              ) : (
                this.renderResult()
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SurveyVotesTable));
