/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import * as Icon from "react-feather";
import Helper from "../../../../utils/Helper";
import { showAlert } from "../../../../redux/actions";

import "./proposal-milestone.scss";
import { Fade } from "react-reveal";

const mapStateToProps = () => {
  return {};
};

const moment = require("moment");

class ProposalMilestone extends Component {
  // Update Data
  updateData(e, index, key) {
    const { milestones, onUpdate } = this.props;
    if (!milestones || !milestones.length) return;

    let data = milestones;

    if (key == "deadline") data[index][key] = moment(e).format("YYYY-MM-DD");
    else if (key == "checked") {
      if (data[index][key]) data[index][key] = false;
      else data[index][key] = true;
    } else data[index][key] = e.target.value;

    if (onUpdate) onUpdate(data);
  }

  // Update Float Field
  updateFloatField(e, index, key) {
    const { milestones, onUpdate } = this.props;
    if (!milestones || !milestones.length) return;

    let value = e.target.value;
    value = Helper.unformatPriceNumber(value);

    let data = milestones;

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    data[index][key] = value;

    if (onUpdate) onUpdate(data);
  }

  // Add Milestone
  addMilestone = (e) => {
    e.preventDefault();
    const { milestones, onUpdate } = this.props;
    if (!milestones || !milestones.length) return;

    let data = milestones;
    data[milestones.length] = {
      title: "",
      details: "",
      criteria: "",
      // kpi: "",
      grant: "",
      deadline: "",
      level_difficulty: "",
      checked: false,
    };

    if (onUpdate) onUpdate(data);
  };

  // Remove Milestone
  removeMilestone = (e) => {
    e.preventDefault();
    const { milestones, onUpdate } = this.props;
    if (!milestones || !milestones.length) return;

    let data = milestones;

    if (data.length < 2) {
      this.props.dispatch(showAlert("You need to have one milestone at least"));
      return;
    }

    data.pop();
    if (onUpdate) onUpdate(data);
  };

  // Render Milestones
  renderMilestones() {
    const { milestones } = this.props;
    const items = [];

    if (milestones && milestones.length) {
      milestones.forEach((milestone, index) => {
        items.push(
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div key={`milestone_${index}`} className="single-milestone-item">
              <div className="c-form-row">
                <label className="mt-5 mb-5" style={{ color: "#9B64E6" }}>
                  Milestone #{index + 1}:
                </label>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="c-form-row">
                    <label>Title of Milestone (10 word limit)</label>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => this.updateData(e, index, "title")}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="c-form-row-deadline">
                    <label>Milestone Deadline</label>
                    <div className="dob-picker-wrap">
                      <DatePicker
                        className="dob-picker"
                        value={
                          milestone.deadline &&
                          milestone.deadline != "0000-00-00"
                            ? moment(milestone.deadline).toDate()
                            : null
                        }
                        onChange={(e) => this.updateData(e, index, "deadline")}
                        onCalendarClose={() => {}}
                        calendarIcon={""}
                        clearIcon={""}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="c-form-row">
                    <label>Level of Difficulty</label>
                    <select
                      value={milestone.level_difficulty}
                      onChange={(e) =>
                        this.updateData(e, index, "level_difficulty")
                      }
                      required
                    >
                      <option value="">Select Level of Difficulty</option>
                      <option value="1">1 (Easy)</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5 (Medium)</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10 (Hard)</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Row End */}
              <div className="c-form-row">
                <label>Details of what will be delivered in milestone</label>
                <textarea
                  value={milestone.details}
                  onChange={(e) => this.updateData(e, index, "details")}
                  required
                ></textarea>
              </div>
              <div className="c-form-row">
                <label>
                  Acceptance criteria: Please enter the specific details on what
                  the deliverable must do to prove this milestone is complete
                  and also detail the KPIs (Key Performance Indicators) for each
                  milestone and your project overall if appropriate. Any KPIs
                  should measure your delivery's performance if KPIs are
                  applicable to your project. This field is where you provide
                  your "definition of done so provide as many details as
                  possible.
                </label>
                <textarea
                  value={milestone.criteria}
                  onChange={(e) => this.updateData(e, index, "criteria")}
                  required
                ></textarea>
              </div>
              {/* <div className="c-form-row">
                <label>{`Please detail the KPIs (Key Performance Indicators) for each milestone and your project overall. Please provide as many details as possible. Any KPIs should measure your delivery's performance.`}</label>
                <textarea
                  value={milestone.kpi}
                  onChange={(e) => this.updateData(e, index, "kpi")}
                  required
                ></textarea>
              </div> */}
              <div className="c-checkbox-item">
                <div
                  className="c-checkbox-itemSymbol"
                  onClick={(e) => this.updateData(e, index, "checked")}
                >
                  {milestone.checked ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label
                  className="font-size-14"
                  onClick={(e) => this.updateData(e, index, "checked")}
                >
                  My entry{" "}
                  <i>
                    <b>clearly</b>
                  </i>{" "}
                  states the "definition of done" to acceptance criteria and
                  KPIs for milestones
                </label>
              </div>
              <div className="c-form-row">
                <label>
                  Grant portion requested for this milestone in Euros
                </label>
                <input
                  type="text"
                  value={
                    milestone.grant
                      ? Helper.formatPriceNumber(milestone.grant)
                      : ""
                  }
                  onChange={(e) => this.updateFloatField(e, index, "grant")}
                  required
                />
              </div>
            </div>
          </Fade>
        );
      });
    }

    return items;
  }

  // Render Alert
  renderAlert() {
    const { total_grant, milestones } = this.props;

    let canStart = false;
    let sum = 0;

    if (milestones) {
      milestones.forEach((milestone) => {
        if (milestone.grant) {
          canStart = true;
          sum += parseFloat(Helper.unformatNumber(milestone.grant));
        }
      });
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
      <div className="c-form-row mt-4">
        <p className="color-danger">{`Please review this section. The total of your milestone is ${Helper.formatPriceNumber(
          sum
        )} while your requested grant total is ${Helper.formatPriceNumber(
          total
        )}. This is a different of ${Helper.formatPriceNumber(
          diff
        )}. Please adjust your numbers to remove this difference.`}</p>
      </div>
    );
  }

  // Render Content
  render() {
    return (
      <section id="proposal-milestone-section">
        <Fade distance={"20px"} bottom duration={100} delay={600}>
          <div className="c-form-row">
            <label>{`Projects are typically divided into milestones. Please propose the milestones in which the total project will be delivered:`}</label>
          </div>
        </Fade>
        {this.renderMilestones()}
        <Fade distance={"20px"} bottom duration={100} delay={600}>
          {this.props.showAction && (
            <div className="new-proposal-button-wrap">
              <a className="btn btn-primary large" onClick={this.addMilestone}>
                <Icon.Plus style={{ marginRight: "5px" }} />
                Add Milestone
              </a>
              <a
                className="btn btn-danger large"
                onClick={this.removeMilestone}
              >
                <Icon.Minus style={{ marginRight: "5px" }} />
                Remove Milestone
              </a>
            </div>
          )}
        </Fade>

        {this.renderAlert()}
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalMilestone);
