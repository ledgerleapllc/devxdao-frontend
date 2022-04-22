import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { PageHeaderComponent } from "../../../components";
import SurveyVotesTable from "../survey-detail/components/tables/survey-votes";
import BidsVotesTable from "../survey-detail/components/tables/bids-votes";
import qs from "qs";
import SurveyDownVotesTable from "../survey-detail/components/tables/survey-downvotes";
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
  sendReminderForSurvey,
} from "../../../utils/Thunk";

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
      status: "",
    };
  }

  componentDidMount() {
    const {
      match: { params },
      location: { search },
    } = this.props;

    const query = qs.parse(search, { ignoreQueryPrefix: true });
    let status = query.status;
    this.setState({ status });

    const surveyId = params.id;
    this.setState({ surveyId });

    this.props.dispatch(
      getSurveyDetail(
        surveyId,
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ surveyData: res.survey });
          }
        }
      )
    );
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

  showAnswer = () => {
    const { currentVoter, surveyId, voters, surveyData } = this.state;
    const temp = voters.find((x) => +x.user_id === +currentVoter);
    this.props.dispatch(
      setActiveModal("show-survey-voter-answer", {
        surveyId,
        user: temp,
        surveyData: surveyData,
      })
    );
  };

  sendReminder = () => {
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
  };

  render() {
    const { authUser } = this.props;
    const { surveyData, surveyId, status } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="survey-detail-full-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent title="" />
          <section className="app-infinite-box">
            {surveyId && surveyData?.type === "grant" && (
              <>
                {status === "upvoted" && (
                  <SurveyVotesTable
                    id={surveyId}
                    cols={surveyData?.number_response}
                    removeFullPageButton
                  />
                )}
                {status === "downvoted" && (
                  <SurveyDownVotesTable
                    id={surveyId}
                    cols={surveyData?.number_response}
                    removeFullPageButton
                  />
                )}
              </>
            )}
            {surveyId && surveyData?.type === "rfp" && (
              <>
                <BidsVotesTable
                  id={surveyId}
                  cols={surveyData?.survey_rfp_bids?.length}
                  removeFullPageButton
                />
              </>
            )}
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SurveyDetail));
