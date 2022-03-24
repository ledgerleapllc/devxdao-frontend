import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import { getMetricDiscussions, getReportDiscussions } from "../../utils/Thunk";
import "./30-days-report.scss";

const mapStateToProps = () => {
  return {};
};

class DaysReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metric: {},
      reports: [],
      sort_key: "proposal_id",
      sort_direction: "desc",
      page_id: 1,
      limit: 999,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  componentDidMount() {
    this.getMetricDiscussions();
    this.getReportDiscussions();
  }

  getReportDiscussions() {
    const { sort_key, sort_direction, page_id, limit } = this.state;

    const params = {
      sort_key,
      sort_direction,
      page_id,
      limit,
    };

    this.props.dispatch(
      getReportDiscussions(
        params,
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ reports: res.proposals });
          }
        }
      )
    );
  }

  getMetricDiscussions() {
    this.props.dispatch(
      getMetricDiscussions(
        {},
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ metric: res.data });
          }
        }
      )
    );
  }

  renderHeader = () => {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-0 c-cols justify-content-center">
            Proposal number
          </div>
          <div className="c-col-1 c-cols justify-content-center">
            Date reached
          </div>
          <div className="c-col-2 c-cols justify-content-center">
            % Attestation
          </div>
          <div className="c-col-3 c-cols justify-content-center">Type</div>
        </div>
      </div>
    );
  };

  renderReports = () => {
    const { reports } = this.state;
    const items = [];

    if (!reports || !reports.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    reports.forEach((item, index) => {
      items.push(
        <li key={`proposal_${index}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-0 c-cols text-center">{item.id}</div>
            <div className="c-col-1 c-cols text-center">
              {moment(item.created_at).local().format("M/D/YYYY")}{" "}
              {moment(item.created_at).local().format("h:mm A")}
            </div>
            <div className="c-col-2 c-cols text-center">
              {item.attestation_rate.toFixed(2)}%
            </div>
            <div className="c-col-3 c-cols text-center text-capitalize">
              {item.content_type}
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  };

  // Render Content
  render() {
    const { metric } = this.state;
    return (
      <div id="days-report-modal">
        <div className="metric-discussion-info">
          <p>
            Attestations reached in last 30 days: {metric?.attestsReached30Days}
          </p>
          <p>
            New discussions in last 30 days: {metric?.newDiscusstions30Days}
          </p>
          <p>
            Percentage attested and moving in last 30 days:&#160;
            {metric?.percentageAttested30Days?.toFixed(2)}%
          </p>
          <p>
            Number of total discussions not attested (all):&#160;
            {metric?.attestsNotReachedAll}
          </p>
          <p>
            Number of total discussions attested (all):&#160;
            {metric?.attestsReachedAll}
          </p>
          <p>
            Percentage attested overall (all time):&#160;
            {metric?.percentageAttestedAll?.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="table-title ">
            This table shows all proposals that have reached attestation in the
            last 30 days
          </p>
          <section id="report-discussions-section" className="app-infinite-box">
            <div className="infinite-content">
              <div className="infinite-contentInner">
                {this.renderHeader()}
                <div className="infinite-body" id="app-discussions-sectionBody">
                  {this.renderReports()}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="actions">
          <button className="btn btn-danger" onClick={this.hideModal}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DaysReport));
