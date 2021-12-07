import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  GlobalRelativeCanvasComponent,
  SwitchButton,
} from "../../../../../../components";
import { getActiveDiscussions } from "../../../../../../utils/Thunk";
import "./style.scss";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-ui/core";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class DiscussionProposalsTable extends Component {
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
      is_winner: null,
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
    this.$elem = document.getElementById("proposal-discussion-scroll-track");
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
      is_winner,
    } = this.state;
    if (loading || calling || finished) return;
    const { ignorePreviousWinner } = this.props;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 20,
    };

    if (is_winner) params.is_winner = is_winner ? 1 : 0;
    if (ignorePreviousWinner) params.ignore_previous_winner = 1;

    this.props.dispatch(
      getActiveDiscussions(
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

  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  changeFilter = (value) => {
    this.setState({ is_winner: value });
    this.reloadTable();
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
              <Link to={`/app/proposal/${item.id}`}>
                <p>{item.id}</p>
              </Link>
            </div>
            <div className="c-col-2 c-cols">
              <p>{moment(item.approved_at).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-3 c-cols">
              <Tooltip title={item.title} placement="bottom">
                <p>{item.title}</p>
              </Tooltip>
            </div>
            <div className="c-col-4 c-cols">
              {item.survey_ranks[0] ? (
                <p>
                  Yes -{" "}
                  <Link
                    className="text-underline"
                    to={`/app/surveys/${item.survey_ranks[0].survey_id}`}
                  >
                    Survey {item.survey_ranks[0].survey_id}
                  </Link>
                </p>
              ) : (
                <p>No</p>
              )}
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { loading, is_winner } = this.state;
    return (
      <>
        <div className="app-infinite-search-wrap custom">
          <label className="heading-style">Proposals for surveying</label>
          {!this.props.hideFilterWinner && (
            <SwitchButton
              labelRight="Winners only"
              value={is_winner}
              onChange={(e) => this.changeFilter(e.target.checked)}
            />
          )}
        </div>
        <div
          className={`discussion-proposals-table infinite-content ${
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
                <div className="c-col-4 c-cols">
                  <label className="font-size-14">Won prior survey?</label>
                </div>
              </div>
            </div>
            <div
              className="infinite-body"
              id="proposal-discussion-scroll-track"
            >
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

export default connect(mapStateToProps)(DiscussionProposalsTable);
