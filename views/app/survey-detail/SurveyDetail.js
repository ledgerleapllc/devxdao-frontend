import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { PageHeaderComponent } from "../../../components";
import SurveyVotesTable from "./components/tables/survey-votes";
import SurveyDownVotesTable from "./components/tables/survey-downvotes";
import RankOfBidsTable from "./components/tables/rank-of-bids";
import BidsVotesTable from "./components/tables/bids-votes";
import {
  setActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../redux/actions";
import {
  getSurveyDetail,
  getSurveyVoters,
  getUserNotVoteSurvey,
  getRFPSurveyVoters,
  sendReminderForRFPSurvey,
  getUserNotVoteRFPSurvey,
  sendReminderForSurvey,
} from "../../../utils/Thunk";
import { TimeClock } from "../shared/time-clock/TimeClock";
import moment from "moment";
import Helper from "../../../utils/Helper";
import { SURVEY_PREFIX } from "../../../utils/Constant";

import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class SurveyDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      surveyId: null,
      surveyData: null,
      voters: [],
      unvotedUsers: [],
      currentVoter: "",
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const surveyId = params.id;
    this.setState({ surveyId });

    this.props.dispatch(
      getSurveyDetail(
        surveyId,
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ surveyData: res.survey });
            if (res.survey.type === "grant") {
              this.props.dispatch(
                getSurveyVoters(
                  surveyId,
                  { limit: 9999 },
                  () => {},
                  (res) => {
                    if (res.success) {
                      this.setState({ voters: res.users });
                    }
                  }
                )
              );
              this.props.dispatch(
                getUserNotVoteSurvey(
                  surveyId,
                  { limit: 9999 },
                  () => {},
                  (res) => {
                    if (res.success) {
                      this.setState({ unvotedUsers: res.users });
                    }
                  }
                )
              );
            }
            if (res.survey.type === "rfp") {
              this.props.dispatch(
                getRFPSurveyVoters(
                  surveyId,
                  { limit: 9999 },
                  () => {},
                  (res) => {
                    if (res.success) {
                      this.setState({ voters: res.users });
                    }
                  }
                )
              );
              this.props.dispatch(
                getUserNotVoteRFPSurvey(
                  surveyId,
                  { limit: 9999 },
                  () => {},
                  (res) => {
                    if (res.success) {
                      this.setState({ unvotedUsers: res.users });
                    }
                  }
                )
              );
            }
          }
        }
      )
    );
  }

  showAnswer = () => {
    const { currentVoter, surveyId, voters, surveyData } = this.state;
    const temp = voters.find((x) => x.email === currentVoter);
    this.props.dispatch(
      setActiveModal("show-survey-voter-answer", {
        surveyId,
        user: temp,
        surveyData: surveyData,
      })
    );
  };

  sendReminder = () => {
    const { surveyData } = this.state;
    if (surveyData?.type === "grant") {
      this.props.dispatch(
        sendReminderForSurvey(
          this.state.surveyId,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                showAlert("Send reminder successfully!", "success")
              );
            }
          }
        )
      );
    }
    if (surveyData?.type === "rfp") {
      this.props.dispatch(
        sendReminderForRFPSurvey(
          this.state.surveyId,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                showAlert("Send reminder successfully!", "success")
              );
            }
          }
        )
      );
    }
  };

  render() {
    const { authUser } = this.props;
    const {
      surveyData,
      surveyId,
      voters,
      unvotedUsers,
      currentVoter,
    } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="survey-detail-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent title="" />
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <h4>
                Survey {SURVEY_PREFIX[surveyData?.type]}
                {surveyData?.id}
              </h4>
            </div>
            <div className="pb-3 pl-5 pr-3">
              <div>
                <span>Status: </span>
                <b className="text-capitalize">{surveyData?.status}</b>
              </div>
              {surveyData?.status === "active" && (
                <div className="flex">
                  <span>Time left: </span>
                  <b className="d-inline-block">
                    <TimeClock lastTime={moment(surveyData?.end_time)} />
                  </b>
                </div>
              )}
              <div>
                <span>Submissions complete:</span>{" "}
                <b>
                  {surveyData?.user_responded} out of {surveyData?.total_member}
                </b>
              </div>
            </div>
            {surveyData?.status === "completed" && (
              <>
                {surveyData?.type === "grant" && (
                  <>
                    <div className="app-infinite-search-wrap">
                      <h4>Winners</h4>
                    </div>
                    <div className="pb-3 pl-5 pr-3">
                      <ul>
                        {surveyData?.survey_ranks
                          .filter((x) => x.is_winner)
                          .map((item) => (
                            <li className="py-2" key={item.id}>
                              {Helper.ordinalSuffixOf(item.rank)} Place -{" "}
                              <Link to={`/app/proposal/${item.proposal?.id}`}>
                                <b>
                                  #{item.proposal?.id} - {item.proposal?.title}
                                </b>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {+surveyData?.downvote === 1 && (
                      <>
                        <div className="app-infinite-search-wrap">
                          <h4>Downvotes</h4>
                        </div>
                        <div className="pb-3 pl-5 pr-3">
                          <ul>
                            {surveyData?.survey_downvote_ranks
                              .filter((x) => x.is_winner)
                              .map((item) => (
                                <li className="py-2" key={item.id}>
                                  {Helper.ordinalSuffixOf(item.rank)} Place -{" "}
                                  <Link
                                    to={`/app/proposal/${item.proposal?.id}`}
                                  >
                                    <b>
                                      #{item.proposal?.id} -{" "}
                                      {item.proposal?.title}
                                    </b>
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                )}
                {surveyData?.type === "rfp" && (
                  <>
                    <div className="app-infinite-search-wrap">
                      <h4>Rank of bids</h4>
                    </div>
                    <RankOfBidsTable surveyId={surveyId} />
                  </>
                )}
              </>
            )}
            {surveyId && (
              <>
                {surveyData?.type === "grant" && (
                  <>
                    <SurveyVotesTable
                      id={surveyId}
                      cols={surveyData?.number_response}
                    />
                    {+surveyData?.downvote === 1 && (
                      <SurveyDownVotesTable
                        id={surveyId}
                        cols={surveyData?.number_response}
                      />
                    )}
                  </>
                )}
                {surveyData?.type === "rfp" && (
                  <>
                    <BidsVotesTable
                      id={surveyId}
                      cols={surveyData?.survey_rfp_bids?.length}
                    />
                  </>
                )}
              </>
            )}
            <div className="app-infinite-search-wrap">
              <h4>View survey responses by user</h4>
            </div>
            <div className="c-form-row pb-3 pl-5 pr-3">
              <label>Select number of responses needed</label>
              <div className="d-flex">
                <select
                  value={currentVoter}
                  onChange={(e) =>
                    this.setState({ currentVoter: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select voter
                  </option>
                  {voters.map((x, i) => (
                    <option key={`option1_${i}`} value={x.user_id}>
                      {x.email}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!currentVoter}
                  className="ml-3 btn btn-primary small"
                  onClick={this.showAnswer}
                >
                  Go
                </button>
              </div>
            </div>
            {surveyData?.status === "active" && (
              <>
                <div className="app-infinite-search-wrap">
                  <h4>Users who have not yet submitted survey</h4>
                </div>
                <div className="pb-3 pl-5 pr-3">
                  <ul>
                    {unvotedUsers.map((user) => (
                      <li className="py-2" key={user.id}>
                        {user.email}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-5 btn btn-primary less-small"
                    onClick={this.sendReminder}
                    disabled={unvotedUsers.length === 0}
                  >
                    Send reminder
                  </button>
                </div>
              </>
            )}
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SurveyDetail));
