import React, { Component } from "react";
import { connect } from "react-redux";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadActiveSurveyTable: state.admin.reloadActiveSurveyTable,
  };
};

class OnboardingStats extends Component {
  constructor(props) {
    super(props);
  }

  renderResult() {
    const { data } = this.props;
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
        <li key={`mile_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{item.month}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.number_onboarded}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.total}</p>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    return (
      <div className="onboarding-stats-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Month</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Number Onboarded</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Total</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="active-rfp-scroll-track">
            {this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(OnboardingStats);
