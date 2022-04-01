import React, { Component } from "react";
import "./style.scss";

class UnattestTable extends Component {
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
          <div className="infinite-row align-items-center d-flex py-2 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{item.forum_name}</p>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    return (
      <div className="unattest-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Forum name</label>
              </div>
            </div>
          </div>
          <div className="infinite-body">{this.renderResult()}</div>
        </div>
      </div>
    );
  }
}

export default UnattestTable;
