import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { hideCanvas, removeActiveModal, showCanvas } from "../../redux/actions";
import Helper from "../../utils/Helper";
import { SURVEY_PREFIX } from "../../utils/Constant";
import { getVoterResponse, getVoterBidResponse } from "../../utils/Thunk";

import "./style.scss";

const mapStateToProps = () => {
  return {};
};

class ShowSurveyVoterAnswer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voted: [],
      downvoted: [],
    };
  }

  componentDidMount() {
    const { surveyId, user, surveyData } = this.props.data;
    if (surveyData?.type === "grant") {
      this.props.dispatch(
        getVoterResponse(
          surveyId,
          user?.id,
          {},
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.setState({ voted: res.voted, downvoted: res.downvoted });
            }
          }
        )
      );
    }
    if (surveyData?.type === "rfp") {
      this.props.dispatch(
        getVoterBidResponse(
          surveyId,
          user?.id,
          {},
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.setState({ voted: res.voted });
            }
          }
        )
      );
    }
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  // Render Content
  render() {
    const { user, surveyId, surveyData } = this.props.data;
    const { voted, downvoted } = this.state;
    return (
      <div id="show-survey-voter-answer-modal">
        <p className="pb-4">{`User ${user?.email} survey answers for survey #${
          SURVEY_PREFIX[surveyData.type]
        }${surveyId}`}</p>
        {surveyData.type === "grant" && (
          <>
            <h5 className="mt-4 text-left">Votes</h5>
            <ul>
              {voted.map((item) => (
                <li key={item.id}>
                  {Helper.ordinalSuffixOf(item.place_choice)} Place -{" "}
                  <Link
                    to={`/app/proposal/${item.id}`}
                    onClick={this.hideModal}
                  >
                    <b>{item.title}</b>
                  </Link>
                </li>
              ))}
            </ul>
            {downvoted?.length > 0 && (
              <>
                <h5 className="mt-4 text-left">Downvotes</h5>
                <ul>
                  {downvoted.map((item) => (
                    <li key={item.id}>
                      {Helper.ordinalSuffixOf(item.place_choice)} Place -{" "}
                      <Link
                        to={`/app/proposal/${item.id}`}
                        onClick={this.hideModal}
                      >
                        <b>{item.title}</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {surveyData.type === "rfp" && (
          <>
            <h5 className="mt-4 text-left">{surveyData.job_title}</h5>
            <ul>
              {voted.map((item) => (
                <li key={item.id}>
                  Rank {item.place_choice}-<b>{item.forum}</b>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="actions">
          <button className="btn btn-primary small" onClick={this.hideModal}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ShowSurveyVoterAnswer));
