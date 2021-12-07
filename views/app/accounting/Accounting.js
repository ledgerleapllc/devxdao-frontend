import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Helper from "../../../utils/Helper";
import "./accounting.scss";
import { downloadCSVAccounting, getMetrics } from "../../../utils/Thunk";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import DosFeeTable from "./components/DosFeeTable";
import moment from "moment";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Accounting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metrics: {},
      params: {},
      total: {},
    };
  }

  componentDidMount() {
    this.fetchMetrics();
  }

  fetchMetrics() {
    this.props.dispatch(
      getMetrics(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const metrics = {
              totalGrant: res.data.totalGrant,
            };
            this.setState({
              metrics,
            });
          }
        }
      )
    );
  }

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
    } else if (["start_date", "end_date"].includes(key)) {
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

  downloadCSV = () => {
    this.props.dispatch(
      downloadCSVAccounting(
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "accounting.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  getTotal = (total) => {
    this.setState({ total });
  };

  render() {
    const { authUser } = this.props;
    const { metrics, total, params } = this.state;
    if (!authUser || !authUser.id) return null;

    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="accounting-page">
        <section className="app-simple-section mb-4">
          <label>System metrics</label>
          <div className="box">
            <div>
              <label className="pr-3">Sum of grants activated:</label>
              <span>
                {Helper.formatPriceNumber(metrics?.totalGrant || 0, "€")}
              </span>
            </div>
          </div>
        </section>
        <section className="app-infinite-box app-simple-section">
          <label>DOS Fee Tracker</label>
          <div className="box">
            <div>
              <label className="pr-3">ETH total for date range:</label>
              <span>{Helper.formatPriceNumber(total?.totalETH || 0, "€")}</span>
            </div>
            <div>
              <label className="pr-3">CC total for date range:</label>
              <span>{Helper.formatPriceNumber(total?.totalCC || 0, "€")}</span>
            </div>
          </div>
          <div className="box">
            <div className="d-flex aligns-items-center justify-content-end app-infinite-search-wrap">
              <div className="mr-4 d-flex flex-column">
                <label className="pb-2">Start date</label>
                <DatePicker
                  format="M/d/yyyy"
                  value={
                    params?.start_date ? new Date(params.start_date) : null
                  }
                  onChange={(val) => this.handleParams("start_date", val)}
                  onCalendarClose={() => {}}
                  calendarIcon={""}
                  clearIcon={""}
                />
              </div>
              <div className="mr-4 d-flex flex-column">
                <label className="pb-2">End date</label>
                <DatePicker
                  format="M/d/yyyy"
                  value={params?.end_date ? new Date(params.end_date) : null}
                  onChange={(val) => this.handleParams("end_date", val)}
                  onCalendarClose={() => {}}
                  calendarIcon={""}
                  clearIcon={""}
                />
              </div>
              <input
                className="mt-4"
                type="text"
                placeholder="Search..."
                onChange={(e) => this.handleSearch(e.target.value)}
              />
              <button
                className="mt-4 btn btn-primary btn-download small ml-2"
                onClick={() => this.downloadCSV()}
              >
                Download
              </button>
            </div>
          </div>
          <div className="box">
            <DosFeeTable params={this.state.params} onTotal={this.getTotal} />
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Accounting));
