import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router";
import { LineChart, PieChart } from "../../../components";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import {
  downloadReport,
  getReportOnboarding,
  getReportReputation,
  getReportTotalRep,
} from "../../../utils/Thunk";
import OnboardingStats from "./components/onboarding-stats";
import ReputationStats from "./components/reputation-stats";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    customModalData: state.global.customModalData,
  };
};
const FROM_YEAR = 2021;
class Report extends Component {
  constructor(props) {
    super(props);
    const currentYear = new Date().getFullYear();
    this.state = {
      currentYear,
      yearOnboarding: currentYear,
      yearReputation: currentYear,
      yearTotalRep: currentYear,
      reportOnboarding: null,
      reportReputation: null,
      reportTotalRep: null,
    };
  }

  componentDidMount() {
    this.fetchReportOnboarding();
    this.fetchReportReputation();
    this.fetchReportTotalRep();
  }

  fetchReportOnboarding = () => {
    this.props.dispatch(
      getReportOnboarding(
        { year: this.state.yearOnboarding },
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const temp = {
              xAxis: res.onboarding_results.map((x) => x.month),
              data: [
                {
                  name: "Onboardings",
                  data: res.onboarding_results.map((x) => x.number_onboarded),
                },
              ],
              rawData: res.onboarding_results,
            };
            this.setState({ reportOnboarding: temp });
          }
        }
      )
    );
  };

  fetchReportReputation = () => {
    this.props.dispatch(
      getReportReputation(
        { year: 2021 },
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const temp = {
              xAxis: res.rep_results[0].rep_results.map((x) => x.month),
              data: res.rep_results.map((user) => ({
                name: user.username,
                data: user.rep_results.map((x) => x.total),
              })),
              rawData: res.rep_results,
            };
            this.setState({ reportReputation: temp });
          }
        }
      )
    );
  };

  fetchReportTotalRep = () => {
    this.props.dispatch(
      getReportTotalRep(
        { year: 2021 },
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const temp = {
              data: res.rep_results.map((user) => ({
                label: user.username,
                value: user.total_rep,
              })),
            };
            this.setState({ reportTotalRep: temp });
          }
        }
      )
    );
  };

  download = () => {
    this.props.dispatch(
      downloadReport(
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "report.pdf");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  handleChangeOnboarding = (e) => {
    this.setState({ yearOnboarding: e.target.value }, () => {
      this.fetchReportOnboarding();
    });
  };

  handleChangeReputation = (e) => {
    this.setState({ yearReputation: e.target.value }, () => {
      this.fetchReportReputation();
    });
  };

  handleChangeTotalRep = (e) => {
    this.setState({ yearTotalRep: e.target.value }, () => {
      this.fetchReportTotalRep();
    });
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="report-page">
        <div className="mb-3 d-flex justify-content-end">
          <button
            className="btn btn-primary btn-download"
            onClick={() => this.download()}
          >
            Export Report
          </button>
        </div>
        <section className="flex flex-column app-infinite-box mb-4">
          <div className="app-infinite-search-wrap">
            <b>Onboarding Stats</b>
            <div className="d-flex">
              <select
                value={this.state.yearOnboarding}
                className="mr-3"
                onChange={(e) => this.handleChangeOnboarding(e)}
              >
                {[...Array(this.state.currentYear - FROM_YEAR + 1).keys()].map(
                  (x) => (
                    <option key={x} value={FROM_YEAR + x}>
                      {FROM_YEAR + x}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div style={{ height: "300px" }}>
            <LineChart
              name="Voting Associates Onboard by Month"
              xAxis={this.state.reportOnboarding?.xAxis}
              data={this.state.reportOnboarding?.data}
            />
          </div>
          <div className="my-5">
            <OnboardingStats data={this.state.reportOnboarding?.rawData} />
          </div>
          <div className="custom-border" />
          <div className="app-infinite-search-wrap">
            <b>Reputation by User</b>
            <div className="d-flex">
              <select
                value={this.state.yearReputation}
                className="mr-3"
                onChange={(e) => this.handleChangeReputation(e)}
              >
                {[...Array(this.state.currentYear - FROM_YEAR + 1).keys()].map(
                  (x) => (
                    <option key={x} value={FROM_YEAR + x}>
                      {FROM_YEAR + x}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div style={{ height: "500px" }}>
            <LineChart
              name="Reputation Counts plus Projections"
              xAxis={this.state.reportReputation?.xAxis}
              data={this.state.reportReputation?.data}
              strokeWidth={1}
            />
          </div>
          <div className="my-5">
            <ReputationStats data={this.state.reportReputation?.rawData} />
          </div>
          <div className="custom-border" />
          <div className="app-infinite-search-wrap">
            <b>Relative Voting Weights</b>
            <div className="d-flex">
              <select
                value={this.state.yearTotalRep}
                className="mr-3"
                onChange={(e) => this.handleChangeTotalRep(e)}
              >
                {[...Array(this.state.currentYear - FROM_YEAR + 1).keys()].map(
                  (x) => (
                    <option key={x} value={FROM_YEAR + x}>
                      {FROM_YEAR + x}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div style={{ height: "700px" }}>
            <PieChart
              name="Relative Voting Weights (Reputation)"
              data={this.state.reportTotalRep?.data}
            />
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Report));
