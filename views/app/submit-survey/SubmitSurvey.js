import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import {
  GlobalRelativeCanvasComponent,
  PageHeaderComponent,
} from "../../../components";
import "./style.scss";
import {
  getActiveDiscussions,
  getUserSurveyDetail,
  submitSurvey,
  submitRFPSurvey,
  getMe,
} from "../../../utils/Thunk";
import {
  hideCanvas,
  saveUser,
  showAlert,
  showCanvas,
} from "../../../redux/actions";
import DiscussionProposalsTable from "../surveys/components/tables/discussion-proposals";
import BidRanksTable from "./components/tables/bid-ranks";
import Helper from "../../../utils/Helper";
import { TimeClock } from "../shared/time-clock/TimeClock";
import moment from "moment";
import { SURVEY_PREFIX } from "../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class SubmitSurvey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading: true,
      currentSurvey: null,
      discussions: [],
      responses: [],
      downvoteResponses: [],
      bidRankResponses: [],
      noSurvey: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;

    this.props.dispatch(
      getUserSurveyDetail(
        id,
        () => {
          this.setState({ showLoading: true });
        },
        (res) => {
          this.setState({ showLoading: false });
          if (res.success) {
            this.setState({ currentSurvey: res.survey });
          } else {
            this.setState({ noSurvey: true });
          }
        }
      )
    );
    this.props.dispatch(
      getActiveDiscussions(
        { limit: 9999, ignore_previous_winner: 1 },
        () => {},
        (res) => {
          const discussions = res.proposals || [];
          this.setState({ discussions });
        }
      )
    );
  }

  checkSkip = (i) => {
    if (i === 0) return null;
    return true;
  };

  renderDiscussions = (i, status) => {
    const { responses, downvoteResponses, discussions } = this.state;
    let otherIds;
    let ids;
    let currentIds;
    if (status === "up") {
      otherIds = downvoteResponses.filter((x) => !!x).map((x) => x.proposal_id);
      ids = responses.filter((x) => !!x).map((x) => x.proposal_id);
      currentIds = ids.filter((x) => x !== responses[i]?.proposal_id);
    } else {
      otherIds = responses.filter((x) => !!x).map((x) => x.proposal_id);
      ids = downvoteResponses.filter((x) => !!x).map((x) => x.proposal_id);
      currentIds = ids.filter((x) => x !== downvoteResponses[i]?.proposal_id);
    }
    const temp = discussions
      .filter((x) => !otherIds.includes(x.id))
      .filter((x) => !currentIds.includes(x.id));
    return temp;
  };

  setResponse = (e, i) => {
    const { responses } = this.state;
    if (e.target.value === "skip") {
      responses[i] = null;
    } else {
      responses[i] = {
        proposal_id: +e.target.value,
        place_choice: i + 1,
      };
    }
    this.setState({ responses });
  };

  setDownvoteResponse = (e, i) => {
    const { downvoteResponses } = this.state;
    if (e.target.value === "skip") {
      downvoteResponses[i] = null;
    } else {
      downvoteResponses[i] = {
        proposal_id: +e.target.value,
        place_choice: i + 1,
      };
    }
    this.setState({ downvoteResponses });
  };

  submitResponse = () => {
    const { authUser } = this.props;
    const { currentSurvey, responses, downvoteResponses } = this.state;
    let body = {
      upvote_responses: responses.filter((x) => !!x),
    };
    if (+currentSurvey.downvote === 1) {
      body.downvote_responses = downvoteResponses.filter((x) => !!x);
    }
    this.props.dispatch(
      submitSurvey(
        currentSurvey.id,
        body,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            currentSurvey.is_submitted = true;
            this.setState({ currentSurvey });
            this.props.dispatch(
              getMe(
                () => {},
                (res) => {
                  this.props.dispatch(hideCanvas());
                  if (res.me && res.me.id) {
                    authUser.has_survey = res.me?.has_survey;
                    this.props.dispatch(saveUser({ ...authUser }));
                  }
                },
                true
              )
            );
            this.props.dispatch(
              showAlert("Submit Responses successfully!", "success")
            );
          } else {
            this.props.dispatch(hideCanvas());
          }
        }
      )
    );
    // if (+currentSurvey.downvote === 1) {
    //   this.props.dispatch(
    //     submitDownvoteSurvey(
    //       currentSurvey.id,
    //       { responses: downvoteResponses.filter((x) => !!x) },
    //       () => {
    //         this.props.dispatch(showCanvas());
    //       },
    //       (res) => {
    //         this.props.dispatch(hideCanvas());
    //         if (res.success) {
    //           currentSurvey.is_submitted = true;
    //           this.setState({ currentSurvey });
    //           authUser.has_survey = 0;
    //           this.props.dispatch(saveUser({ ...authUser }));
    //           this.props.dispatch(
    //             showAlert("Submit Responses successfully!", "success")
    //           );
    //         }
    //       }
    //     )
    //   );
    // }
  };

  submitRFPResponse = () => {
    const { authUser } = this.props;
    const { currentSurvey, bidRankResponses } = this.state;
    const temp = [...bidRankResponses].map((x) => {
      delete x.info;
      return x;
    });
    let body = {
      responses: temp,
    };
    this.props.dispatch(
      submitRFPSurvey(
        currentSurvey.id,
        body,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            currentSurvey.is_submitted = true;
            this.setState({ currentSurvey });
            this.props.dispatch(
              getMe(
                () => {},
                (res) => {
                  this.props.dispatch(hideCanvas());
                  if (res.me && res.me.id) {
                    authUser.has_survey = res.me?.has_survey;
                    this.props.dispatch(saveUser({ ...authUser }));
                  }
                },
                true
              )
            );
            this.props.dispatch(
              showAlert("Submit RFP Responses successfully!", "success")
            );
          } else {
            this.props.dispatch(hideCanvas());
          }
        }
      )
    );
  };

  checkUserInput = () => {
    const { responses, downvoteResponses, currentSurvey } = this.state;
    const lengthUpvoteResponses = responses.filter((x) => x !== undefined)
      .length;
    const lengthDownvoteResponses = downvoteResponses.filter(
      (x) => x !== undefined
    ).length;
    if (currentSurvey?.downvote) {
      return (
        +lengthUpvoteResponses === +currentSurvey?.number_response &&
        +lengthDownvoteResponses === +currentSurvey?.number_response
      );
    } else {
      return +lengthUpvoteResponses === +currentSurvey?.number_response;
    }
  };

  checkUserBidsInput = () => {
    const { bidRankResponses, currentSurvey } = this.state;

    return (
      currentSurvey?.survey_rfp_bids.length ===
      bidRankResponses.filter((x) => !!x).length
    );
  };

  setRankBids = (e, index) => {
    const temp = this.state.bidRankResponses;
    temp[index] = {
      bid: index + 1,
      info: this.state.currentSurvey?.survey_rfp_bids[index],
      place_choice: +e.target.value,
    };
    this.setState({ bidRankResponses: [...temp] });
  };

  renderSelectBids = (currentIndex) => {
    const { bidRankResponses, currentSurvey } = this.state;
    const listRanks = currentSurvey?.survey_rfp_bids.map(
      (x, index) => index + 1
    );
    const temp = bidRankResponses
      .filter((x) => x?.bid !== currentIndex + 1)
      .map((x) => +x?.place_choice);
    const availableRanks = listRanks.filter((x) => !temp.includes(x));
    return availableRanks;
  };

  removeBidRank = (index) => {
    let { bidRankResponses } = this.state;
    const ind = bidRankResponses.findIndex((x) => x?.bid === index + 1);
    if (ind >= 0) bidRankResponses[ind] = undefined;
    this.setState({ bidRankResponses: [...bidRankResponses] });
  };

  render() {
    const { authUser } = this.props;
    const {
      currentSurvey,
      showLoading,
      responses,
      noSurvey,
      downvoteResponses,
      bidRankResponses,
    } = this.state;

    if (!authUser || !authUser.id) return null;
    if (!authUser.is_member) return <Redirect to="/" />;

    return (
      <div id="app-submit-survey-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent title="" />
          <section className="app-infinite-box mb-4">
            {showLoading && <GlobalRelativeCanvasComponent />}
            {!showLoading && (
              <>
                <div className="app-infinite-search-wrap">
                  {currentSurvey?.status === "active" &&
                    !currentSurvey?.is_submitted && (
                      <h4>
                        Welcome to Survey #{SURVEY_PREFIX[currentSurvey?.type]}
                        {currentSurvey?.id}
                      </h4>
                    )}
                  {currentSurvey?.status === "active" &&
                    currentSurvey?.is_submitted && (
                      <h4>Thank you for submitting</h4>
                    )}
                  {currentSurvey?.status === "completed" && (
                    <h4>
                      Survey #{SURVEY_PREFIX[currentSurvey?.type]}
                      {currentSurvey?.id} has ended
                    </h4>
                  )}
                  {currentSurvey?.status === "cancel" && (
                    <h4>
                      Survey #{SURVEY_PREFIX[currentSurvey?.type]}
                      {currentSurvey?.id} has cancelled
                    </h4>
                  )}
                  {noSurvey && (
                    <div>
                      <h6>
                        There are no active surveys at this time. Please check
                        back again later.
                      </h6>
                      <div className="py-3">
                        <Link to="/app" className="btn btn-primary less-small">
                          Back to dashboard
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                {currentSurvey?.status === "active" &&
                  currentSurvey?.type === "grant" &&
                  !currentSurvey?.is_submitted && (
                    <>
                      <div className="pb-3 pl-5 pr-3">
                        <div className="c-form-row">
                          <h5 className="my-2 text-bold">UPVOTES</h5>
                          <label>
                            Please select your favorite
                            {currentSurvey?.number_response} proposals from the
                            pool of proposals that have not yet begun their
                            informal vote.
                          </label>
                          <div className="flex box-vote">
                            {Array(+currentSurvey?.number_response || 0)
                              .fill(1)
                              .map((choice, i) => (
                                <select
                                  key={i}
                                  defaultValue=""
                                  value={responses[i]?.proposal_id}
                                  onChange={(e) => this.setResponse(e, i)}
                                >
                                  <option value="" disabled>
                                    Select your {Helper.ordinalSuffixOf(i + 1)}{" "}
                                    place choice
                                  </option>
                                  {this.checkSkip(i) && (
                                    <option value="skip">Skip</option>
                                  )}
                                  {this.renderDiscussions(i, "up").map(
                                    (item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.id} - {item.title}
                                      </option>
                                    )
                                  )}
                                </select>
                              ))}
                          </div>
                        </div>
                        {+currentSurvey?.downvote === 1 && (
                          <div className="mt-4 c-form-row">
                            <h5 className="my-2 text-bold">DOWNVOTES</h5>
                            <label>
                              {`Please select the ${currentSurvey?.number_response}
                              grants that you DO NOT think should move forward.
                              The ${currentSurvey?.number_response} of grants with
                              the most DOWNVOTES will have their discussion ended
                              and NOT move forward to become a grant. You may skip
                              responses if you choose.`}
                            </label>
                            <div className="flex box-vote">
                              {Array(+currentSurvey?.number_response || 0)
                                .fill(1)
                                .map((choice, i) => (
                                  <select
                                    key={i}
                                    defaultValue=""
                                    value={downvoteResponses[i]?.proposal_id}
                                    onChange={(e) =>
                                      this.setDownvoteResponse(e, i)
                                    }
                                  >
                                    <option value="" disabled>
                                      {`Select your ${Helper.ordinalSuffixOf(
                                        i + 1
                                      )} place choice`}
                                    </option>
                                    {this.checkSkip(i) && (
                                      <option value="skip">Skip</option>
                                    )}
                                    {this.renderDiscussions(i, "down").map(
                                      (item) => (
                                        <option key={item.id} value={item.id}>
                                          {item.id} - {item.title}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ))}
                            </div>
                          </div>
                        )}
                        <button
                          className="mt-3 btn btn-primary less-small"
                          onClick={this.submitResponse}
                          disabled={!this.checkUserInput()}
                        >
                          Submit responses
                        </button>
                        <div className="d-flex pt-2 pl-2">
                          Time remaining:
                          <b className="pl-2">
                            <TimeClock
                              lastTime={moment(currentSurvey?.end_time)}
                            />
                          </b>
                        </div>
                        <p className="py-5">
                          Click any proposal in the table below to see more
                          details. All proposals here have not yet won a ranking
                          position in a prior survey and are still in the
                          discussion phase.
                        </p>
                      </div>
                      <DiscussionProposalsTable
                        hideWonColumn
                        hideFilterWinner
                        ignorePreviousWinner
                      />
                    </>
                  )}
                {currentSurvey?.status === "active" &&
                  currentSurvey?.type === "rfp" &&
                  !currentSurvey?.is_submitted && (
                    <>
                      <div className="pb-3 pl-5 pr-3">
                        <div className="rfp-info">
                          <div className="pb-2">
                            <label className="pr-5">Title of Job:</label>
                            <b>{currentSurvey?.job_title}</b>
                          </div>
                          <div className="pb-2">
                            <label className="pr-5">Description of Job:</label>
                            <p>
                              <b>{currentSurvey?.job_description}</b>
                            </p>
                          </div>
                          <div className="pb-2">
                            <label className="pr-5">
                              Estimated price of Job:
                            </label>
                            <b>
                              {Helper.formatPriceNumber(
                                currentSurvey?.total_price || "",
                                "€"
                              )}
                            </b>
                          </div>
                          <div className="pb-2">
                            <label className="pr-5">Job Start Date:</label>
                            <b>
                              {moment(currentSurvey?.created_at)
                                .local()
                                .format("M/D/YYYY HH:mm A")}
                            </b>
                          </div>
                          <div className="pb-2">
                            <label className="pr-5">Job completion date:</label>
                            <b>
                              {moment(currentSurvey?.end_time)
                                .local()
                                .format("M/D/YYYY HH:mm A")}
                            </b>
                          </div>
                        </div>
                        <div className="pt-5 c-form-row">
                          <label>
                            {`Thanks for starting the survey. You must read and rank each bid below from your favorite to your least favorite. Your chosen ranks will show in the table below as you complete the dropdown in each box. You can click to remove any ranks directly in the table.`}
                          </label>
                        </div>
                        <div>
                          {currentSurvey?.survey_rfp_bids.map((bid, index) => (
                            <div className="bid-item my-3" key={index}>
                              <b className="font-size-18">Bid {index + 1}</b>
                              <div className="pt-2 c-form-row">
                                <select
                                  defaultValue=""
                                  value={
                                    bidRankResponses[index]?.place_choice || ""
                                  }
                                  onChange={(e) => this.setRankBids(e, index)}
                                >
                                  <option value="" disabled>
                                    {`Select rank`}
                                  </option>
                                  {this.renderSelectBids(index).map((item) => (
                                    <option key={item} value={item}>
                                      Rank {item} of{" "}
                                      {currentSurvey?.survey_rfp_bids.length}
                                    </option>
                                  ))}
                                </select>
                                {bidRankResponses.findIndex(
                                  (x) => x?.bid === index + 1
                                ) >= 0 && (
                                  <button
                                    className="btn btn-primary extra-small btn-fluid-small"
                                    onClick={() => this.removeBidRank(index)}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <div className="pb-2">
                                <label className="pr-2">Name:</label>
                                <b>{bid.name}</b>
                              </div>
                              <div className="pb-2">
                                <label className="pr-2">Amount of Bid:</label>
                                <b>{bid.amount_of_bid}</b>
                              </div>
                              <div className="pb-2">
                                <label className="pr-2">Delivery date:</label>
                                <b>
                                  {moment(bid.delivery_date)
                                    .local()
                                    .format("M/D/YYYY HH:mm A")}
                                </b>
                              </div>
                              <div className="pb-2">
                                <label className="pr-2">
                                  Additional notes:
                                </label>
                                <b>
                                  {bid.additional_note
                                    ? bid.additional_note
                                    : "-"}
                                </b>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-5">
                        <BidRanksTable
                          survey={currentSurvey}
                          data={bidRankResponses}
                          onRemove={this.removeBidRank}
                        />
                      </div>
                      <div className="py-5 text-center">
                        <p>
                          You need to rank{" "}
                          <b>
                            {currentSurvey?.survey_rfp_bids.length -
                              bidRankResponses.filter((x) => !!x).length}
                          </b>{" "}
                          more bids before you can submit.
                        </p>
                        <button
                          className="mt-3 btn btn-primary less-small"
                          onClick={this.submitRFPResponse}
                          disabled={!this.checkUserBidsInput()}
                        >
                          Submit
                        </button>
                        <div className="d-flex justify-content-center pt-2 pl-2">
                          Time remaining:
                          <b className="pl-2">
                            <TimeClock
                              lastTime={moment(currentSurvey?.end_time)}
                            />
                          </b>
                        </div>
                      </div>
                    </>
                  )}
                {currentSurvey?.status === "active" &&
                  currentSurvey?.is_submitted && (
                    <div className="pb-3 pl-3 pr-3">
                      <p className="pb-5">
                        We are still collecting responses from all other voting
                        associates and will update you with the winners on the
                        next public call.
                      </p>
                      <Link to="/app" className="btn btn-primary less-small">
                        Back to dashboard
                      </Link>
                    </div>
                  )}
                {currentSurvey?.status === "completed" &&
                  currentSurvey?.type === "grant" && (
                    <div className="pb-3 pl-3 pr-3">
                      <p>The winners are listed below.</p>
                      <div className="my-3">
                        {currentSurvey?.survey_ranks
                          ?.filter((x) => x.is_winner)
                          .map((x, i) => (
                            <p className="py-2" key={i}>
                              {Helper.ordinalSuffixOf(i + 1)} Place -{" "}
                              <Link to={`/app/proposal/${x.proposal?.id}`}>
                                {x.proposal?.title}
                              </Link>
                            </p>
                          ))}
                      </div>
                      {+currentSurvey?.downvote === 1 && (
                        <>
                          <p>The downvotes are listed below.</p>
                          <div className="my-3">
                            {currentSurvey?.survey_downvote_ranks
                              ?.filter((x) => x.is_winner)
                              .map((x, i) => (
                                <p className="py-2" key={i}>
                                  {Helper.ordinalSuffixOf(i + 1)} Place -{" "}
                                  <Link to={`/app/proposal/${x.proposal?.id}`}>
                                    {x.proposal?.title}
                                  </Link>
                                </p>
                              ))}
                          </div>
                        </>
                      )}
                      <Link to="/app" className="btn btn-primary less-small">
                        Back to dashboard
                      </Link>
                    </div>
                  )}
                {currentSurvey?.status === "completed" &&
                  currentSurvey?.type === "rfp" && (
                    <div className="pb-3 pl-3 pr-3">
                      <p>The winners are listed below.</p>
                      <div className="my-3">
                        {currentSurvey?.survey_rfp_ranks
                          ?.filter((x) => x.is_winner)
                          .map((x, i) => (
                            <p className="py-2" key={i}>
                              Rank {x.rank} - {x.survey_rfp_bid?.forum}
                            </p>
                          ))}
                      </div>
                      <Link to="/app" className="btn btn-primary less-small">
                        Back to dashboard
                      </Link>
                    </div>
                  )}
                {currentSurvey?.status === "cancel" && (
                  <div className="pb-3 pl-3 pr-3">
                    <Link to="/app" className="btn btn-primary less-small">
                      Back to dashboard
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SubmitSurvey));
