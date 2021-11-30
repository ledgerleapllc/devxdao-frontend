import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { GRANTTYPES } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

import "./proposal-grant.scss";

const mapStateToProps = () => {
  return {};
};

class ProposalGrant extends Component {
  toggle(index) {
    let { grants, onUpdate } = this.props;
    const key = `grant_${index}`;

    if (grants[key] && grants[key].checked) {
      grants[key] = {
        ...grants[key],
        checked: false,
      };
    } else {
      if (!grants[key]) grants[key] = {};
      grants[key] = {
        ...grants[key],
        type: index,
        checked: true,
      };
    }

    if (onUpdate) onUpdate(grants);
  }

  inputOther(e, index) {
    let { grants, onUpdate } = this.props;
    const key = `grant_${index}`;

    if (!grants[key]) grants[key] = {};
    grants[key] = {
      ...grants[key],
      type: index,
      type_other: e.target.value,
    };

    if (onUpdate) onUpdate(grants);
  }

  inputPercentage(e, index) {
    let { grants, onUpdate } = this.props;
    const key = `grant_${index}`;

    let value = e.target.value;
    value = Helper.unformatPercentage(value);

    if (value && isNaN(value)) value = "";
    if (value) value = parseInt(value).toString();
    if (value && parseInt(value) < 0) value = "";
    if (value && parseInt(value) > 100) value = "";

    if (!grants[key]) grants[key] = {};
    grants[key] = {
      ...grants[key],
      type: index,
      percentage: value,
    };

    if (onUpdate) onUpdate(grants);
  }

  inputAmount(e, index) {
    let { grants, onUpdate } = this.props;
    const key = `grant_${index}`;

    let value = e.target.value;
    value = Helper.unformatPriceNumber(value);

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    if (!grants[key]) grants[key] = {};
    grants[key] = {
      ...grants[key],
      type: index,
      grant: value,
    };

    if (value) {
      grants[key] = {
        ...grants[key],
        checked: true,
      };
    } else {
      grants[key] = {
        ...grants[key],
        checked: false,
      };
    }

    if (onUpdate) onUpdate(grants);
  }

  renderGrants() {
    const { grants } = this.props;
    const items = [];

    GRANTTYPES.forEach((grant, index) => {
      const key = `grant_${index}`;
      const checked = grants[key] && grants[key].checked ? true : false;
      const value = grants[key] && grants[key].grant ? grants[key].grant : "";
      const type_other =
        grants[key] && grants[key].type_other ? grants[key].type_other : "";
      const percentage =
        grants[key] && grants[key].percentage ? grants[key].percentage : "";

      if (index != GRANTTYPES.length - 1) {
        items.push(
          <div key={`grant_${index}`} className="c-checkbox-item normal">
            <div
              className="c-checkbox-itemSymbol"
              onClick={() => this.toggle(index)}
            >
              {checked ? (
                <Icon.CheckSquare color="#9B64E6" />
              ) : (
                <Icon.Square color="#9B64E6" />
              )}
            </div>
            <div className="c-checkbox-itemContent">
              <label className="d-block" onClick={() => this.toggle(index)}>
                {grant}
              </label>
              <div className="c-checkbox-itemContentInner">
                <input
                  type="text"
                  placeholder="Amount for this item in Euros"
                  onChange={(e) => this.inputAmount(e, index)}
                  value={
                    value ? Helper.formatPriceNumber(value.toString()) : ""
                  }
                />
                <input
                  type="text"
                  value={Helper.formatPercentage(percentage)}
                  placeholder=""
                  className="grant-percentage"
                  onChange={(e) => this.inputPercentage(e, index)}
                />
                <label>Percentage kept by OP</label>
              </div>
            </div>
          </div>
        );
      } else {
        items.push(
          <div key={`grant_${index}`} className="c-checkbox-item other">
            <div
              className="c-checkbox-itemSymbol"
              onClick={() => this.toggle(index)}
              style={{ marginTop: "12px" }}
            >
              {checked ? (
                <Icon.CheckSquare color="#9B64E6" />
              ) : (
                <Icon.Square color="#9B64E6" />
              )}
            </div>
            <div className="c-checkbox-itemContent">
              <div className="c-checkbox-itemOther">
                <label onClick={() => this.toggle(index)}>{grant}</label>
                <input
                  type="text"
                  placeholder="Enter use of funds"
                  value={type_other}
                  onChange={(e) => this.inputOther(e, index)}
                />
              </div>
              <div className="c-checkbox-itemContentInner">
                <input
                  type="text"
                  placeholder="Amount for this item in Euros"
                  onChange={(e) => this.inputAmount(e, index)}
                  value={
                    value ? Helper.formatPriceNumber(value.toString()) : ""
                  }
                />
                <input
                  type="text"
                  value={Helper.formatPercentage(percentage)}
                  className="grant-percentage"
                  onChange={(e) => this.inputPercentage(e, index)}
                />
                <label>Percentage kept by OP</label>
              </div>
            </div>
          </div>
        );
      }
    });

    return items;
  }

  renderAlert() {
    const { total_grant, grants } = this.props;

    let canStart = false;
    let sum = 0;

    if (grants) {
      for (let i in grants) {
        if (grants[i].grant && grants[i].checked) {
          canStart = true;
          sum += parseFloat(Helper.unformatNumber(grants[i].grant));
        }
      }
    }
    sum = parseFloat(Helper.adjustNumericString(sum.toString(), 2));

    if (total_grant) canStart = true;

    if (!canStart) return null;
    const total = total_grant
      ? parseFloat(Helper.unformatNumber(total_grant))
      : 0;
    let diff = Math.abs(total - sum);
    diff = parseFloat(Helper.adjustNumericString(diff.toString(), 2));

    if (!diff) return null;

    return (
      <div className="c-form-row">
        <p className="color-danger">{`Please review this section. The total of your milestone is ${Helper.formatPriceNumber(
          sum.toString()
        )} while your requested grant total is ${Helper.formatPriceNumber(
          total.toString()
        )}. This is a different of ${Helper.formatPriceNumber(
          diff.toString()
        )}. Please adjust your numbers to remove this difference.`}</p>
      </div>
    );
  }

  render() {
    return (
      <section id="proposal-grant-section">
        {!this.props.hideLabel && (
          <div className="c-form-row mt-5">
            <label>{`Please select all planned uses for your grant funds. Select all that apply and enter the estimated portion of grant funds allocated for each. All totals must equal the upper amount`}</label>
          </div>
        )}
        <div className="c-form-row">
          <div className="row">
            <div className="col-md-10">{this.renderGrants()}</div>
          </div>
        </div>
        {this.renderAlert()}
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalGrant);
