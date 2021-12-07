import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { Checkbox, PageHeaderComponent } from "../../../components";
import "./style.scss";
import { launchSurvey } from "../../../utils/Thunk";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";
import DiscussionProposalsTable from "../surveys/components/tables/discussion-proposals";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class StartSurvey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        number_response: "",
        time_unit: "",
        time: "",
        downvote: 0,
      },
    };
  }

  setFormValue = (key, value) => {
    const { form } = this.state;
    form[key] = value;
    this.setState({ form });
  };

  doLaunchSurvey = () => {
    const form = {
      ...this.state.form,
      number_response: +this.state.form.number_response,
      time_unit: this.state.form.time_unit,
      time: +this.state.form.time,
    };
    this.props.dispatch(
      launchSurvey(
        form,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/app/surveys");
            this.props.dispatch(
              showAlert("Launch survey successfully!", "success")
            );
          }
        }
      )
    );
  };

  generateTextResponse = (number_response) => {
    return `${number_response} response${number_response > 1 ? "s" : ""}`;
  };

  render() {
    const { authUser } = this.props;
    const {
      form: { number_response, time_unit, time, downvote },
    } = this.state;

    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="app-start-survey-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent title="" />
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <h4>Start new survey</h4>
            </div>
            <div className="pb-3 pl-5 pr-3">
              <div className="c-form-row">
                <label>Select number of responses needed</label>
                <select
                  value={number_response}
                  onChange={(e) =>
                    this.setFormValue("number_response", e.target.value)
                  }
                >
                  <option value="">Select...</option>
                  {Array(10)
                    .fill(1)
                    .map((x, i) => (
                      <option key={`option1_${i}`} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label>Select how long the survey will run</label>
                <div className="d-flex">
                  <div className="c-form-row mr-2">
                    <select
                      value={time}
                      onChange={(e) =>
                        this.setFormValue("time", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {Array(100)
                        .fill(1)
                        .map((x, i) => (
                          <option key={`option2_${i}`} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="c-form-row">
                    <select
                      value={time_unit}
                      onChange={(e) =>
                        this.setFormValue("time_unit", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {["minutes", "hours", "days"].map((x, i) => (
                        <option key={`option3_${i}`} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Checkbox
                  value={downvote}
                  onChange={(e) => this.setFormValue("downvote", e ? 1 : 0)}
                  text="Gather downvotes"
                />
              </div>
              {!!number_response && !!time && !!time_unit && (
                <p className="py-5">
                  {`You have selected to start a survey to collet the top ${this.generateTextResponse(
                    number_response
                  )} from all VAs. This survey will last ${time} ${time_unit}. Please click to begin this survey. All VAs will receive an email.`}
                </p>
              )}
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary less-small"
                  disabled={!number_response || !time || !time_unit}
                  onClick={this.doLaunchSurvey}
                >
                  Launch Survey
                </button>
              </div>
            </div>
            <DiscussionProposalsTable
              hideWonColumn
              hideFilterWinner
              ignorePreviousWinner
            />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(StartSurvey));
