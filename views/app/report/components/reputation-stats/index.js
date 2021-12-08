import React, { Component } from "react";
import { connect } from "react-redux";
import "./style.scss";
import { DECIMALS } from "../../../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadActiveSurveyTable: state.admin.reloadActiveSurveyTable,
  };
};

class ReputationStats extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props;

    if (!data || !data.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }
    const columns = data[0].rep_results.map((x) => x.month);
    return (
      <div className="reputation-stats-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">User</label>
              </div>
              {columns.map((y, index) => (
                <div
                  className="c-col-custom c-cols"
                  key={index}
                  style={{ width: `${85 / columns.length}%` }}
                >
                  <label className="font-size-14">{y}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="infinite-body" id="active-rfp-scroll-track">
            <ul>
              {data.map((user, ind) => (
                <li key={`rep_stats_${ind}`}>
                  <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
                    <div className="c-col-1 c-cols">
                      <p>{user.username}</p>
                    </div>
                    {user.rep_results.map((x, index) => (
                      <div
                        className="c-col-custom c-cols"
                        key={index}
                        style={{ width: `${85 / columns.length}%` }}
                      >
                        <p>{parseFloat(x.total)?.toFixed?.(DECIMALS)}</p>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ReputationStats);
