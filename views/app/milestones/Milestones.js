import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./milestones.scss";
import MilestonesInReview from "./components/MilestonesInReview";
import AllMilestones from "./components/AllMilestones";
import Helper from "../../../utils/Helper";
import { SwitchButton } from "../../../components";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import {
  downloadCSVMilestones,
  getAllOPMilestones,
  getAllProposalMilestones,
} from "../../../utils/Thunk";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import moment from "moment";
import { hideCanvas, showCanvas } from "../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Milestones extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      total: {},
      ops: [],
      proposals: [],
    };
    this.timer = null;
    this.getOPs();
    this.getProposalFilter();
  }

  getOPs() {
    this.props.dispatch(
      getAllOPMilestones(
        {},
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ ops: res.emails });
          }
        }
      )
    );
  }

  getProposalFilter() {
    this.props.dispatch(
      getAllProposalMilestones(
        {},
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ proposals: res.proposalIds.map((x) => `${x}`) });
          }
        }
      )
    );
  }

  downloadCSV = () => {
    this.props.dispatch(
      downloadCSVMilestones(
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "milestones.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  handleParams = (key, value) => {
    const { params } = this.state;
    if (key === "notSubmitted") {
      if (value) {
        params[key] = 1;
      } else {
        delete params[key];
      }
    } else if (["hidePaid", "hideCompletedGrants"].includes(key)) {
      if (value) {
        params[key] = 1;
      } else {
        delete params[key];
      }
    } else if (["startDate", "endDate"].includes(key)) {
      if (value) {
        const temp = moment(value).local().format("YYYY-MM-DD");
        params[key] = temp;
      } else {
        delete params[key];
      }
    } else {
      if (value) {
        params[key] = value;
      } else {
        delete params[key];
      }
    }
    this.setState({ params: { ...params } });
  };

  // Handle Search
  handleSearch = (val) => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      this.handleParams("search", val);
    }, 500);
  };

  getTotal = (total) => {
    this.setState({ total });
  };

  render() {
    const { authUser } = this.props;
    const { total, params } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div className="h-100 milestones-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Milestones in Review</label>
            </div>
            <MilestonesInReview />
          </section>
          <section className="app-infinite-box">
            <div className="app-infinite-search-wrap align-items-start">
              <label>All Milestones</label>
              <div className="d-flex">
                <div className="mr-4 d-flex flex-column">
                  <label className="pb-2">Start date</label>
                  <DatePicker
                    format="M/d/yyyy"
                    value={params.startDate ? new Date(params.startDate) : null}
                    onChange={(val) => this.handleParams("startDate", val)}
                    onCalendarClose={() => {}}
                    calendarIcon={""}
                    clearIcon={""}
                  />
                </div>
                <div className="mr-4 d-flex flex-column">
                  <label className="pb-2">End date</label>
                  <DatePicker
                    format="M/d/yyyy"
                    value={params.endDate ? new Date(params.endDate) : null}
                    onChange={(val) => this.handleParams("endDate", val)}
                    onCalendarClose={() => {}}
                    calendarIcon={""}
                    clearIcon={""}
                  />
                </div>
                <div className="mr-4 d-flex flex-column">
                  <label className="pb-2">Filter by Grant</label>
                  <Autocomplete
                    onChange={(event, newValue) => {
                      this.handleParams("proposalId", newValue);
                    }}
                    className="autocomplete-custom"
                    options={this.state.proposals}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select"
                        variant="outlined"
                      />
                    )}
                  />
                </div>
                <div className="mr-4 d-flex flex-column">
                  <label className="pb-2">Filter by OP</label>
                  <Autocomplete
                    className="autocomplete-custom"
                    onChange={(event, newValue) => {
                      this.handleParams("email", newValue);
                    }}
                    options={this.state.ops}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select"
                        variant="outlined"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="app-infinite-search-wrap py-0">
              <div>
                <table className="total-table">
                  <tbody>
                    <tr>
                      <td className="pr-2">Total value of shown:</td>
                      <td>
                        {Helper.formatPriceNumber(total.totalGrant || 0, "€")}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Total paid amount of shown:</td>
                      <td>
                        {Helper.formatPriceNumber(total.totalPaid || 0, "€")}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Total unpaid amount of shown:</td>
                      <td>
                        {Helper.formatPriceNumber(total.totalUnpaid || 0, "€")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <SwitchButton
                  labelRight="Hide paid"
                  onChange={(e) =>
                    this.handleParams("hidePaid", e.target.checked)
                  }
                />
                <SwitchButton
                  labelRight="Hide milestones for completed grants"
                  onChange={(e) =>
                    this.handleParams("hideCompletedGrants", e.target.checked)
                  }
                />
              </div>
              <div>
                <input
                  className="my-1"
                  type="text"
                  placeholder="Search..."
                  onChange={(e) => this.handleSearch(e.target.value)}
                />
                <button
                  className="my-1 btn btn-primary btn-download small ml-2"
                  onClick={() => this.downloadCSV()}
                >
                  Download
                </button>
              </div>
            </div>
            <div className="pt-4">
              <AllMilestones
                params={this.state.params}
                onTotal={this.getTotal}
              />
            </div>
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Milestones));
