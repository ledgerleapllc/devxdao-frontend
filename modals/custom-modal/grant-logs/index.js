import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import "./style.scss";
import { withRouter } from "react-router-dom";

const GRANT_LOGS = {
  system_sent_doc: {
    type: "API doc send",
    details: "System sent document",
  },
  system_completed: {
    type: "Complete",
    details: "Agreement marked complete",
  },
  system_cancelled_doc: {
    type: "API doc cancel",
    details: "System voided document",
  },
  system_reminded_doc: {
    type: "API reminder",
    details: "System sent document",
  },
  admin_reminded: {
    type: "Remind clicked",
    details: "Admin clicked remind link",
  },
  admin_resent: {
    type: "Resent clicked",
    details: "Admin clicked resend link",
  },
  signed: {
    type: "Signature",
    details: "signed",
  },
};

const mapStateToProps = () => {
  return {};
};

class GrantLogsTable extends Component {
  constructor(props) {
    super(props);
  }

  renderResult() {
    const data = this.props.grantLogs;
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
        <li key={`log_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{moment(item.created_at).local().format("D/M/YYYY h:mm A")}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>
                {item.type === "signed"
                  ? GRANT_LOGS["signed"].type
                  : GRANT_LOGS[`${item.role}_${item.type}`]?.type}
              </p>
            </div>
            <div className="c-col-3 c-cols">
              {item.role === "admin" && <p>{item.email}</p>}
              {item.role !== "admin" && (
                <p className="text-uppercase">{item.role}</p>
              )}
            </div>
            <div className="c-col-4 c-cols">
              <p>
                {item.type === "signed" ? (
                  <>
                    <span className="text-uppercase">{item.role}</span>
                    <span> {GRANT_LOGS["signed"]?.details}</span>
                  </>
                ) : (
                  GRANT_LOGS[`${item.role}_${item.type}`]?.details
                )}
              </p>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    return (
      <div className="grant-logs-table">
        <div className="infinite-content">
          <div className="infinite-contentInner">
            <div className="infinite-header">
              <div className="infinite-headerInner">
                <div className="c-col-1 c-cols">
                  <label className="font-size-14">Date/time</label>
                </div>
                <div className="c-col-2 c-cols">
                  <label className="font-size-14">Type</label>
                </div>
                <div className="c-col-3 c-cols">
                  <label className="font-size-14">User</label>
                </div>
                <div className="c-col-4 c-cols">
                  <label className="font-size-14">Details</label>
                </div>
              </div>
            </div>
            <div className="infinite-body">{this.renderResult()}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(GrantLogsTable));
