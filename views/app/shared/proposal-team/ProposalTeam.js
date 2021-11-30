import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { COUNTRYLIST } from "../../../../utils/Constant";
import { showAlert } from "../../../../redux/actions";

import "./proposal-team.scss";
import { Checkbox } from "../../../../components";
import { Fade } from "react-reveal";

const mapStateToProps = () => {
  return {};
};

class ProposalTeam extends Component {
  toggleCheckbox = (val) => {
    const { onUpdateChecked } = this.props;
    if (onUpdateChecked) onUpdateChecked(val);
  };

  updateData(e, index, key) {
    const { members, onUpdate } = this.props;
    if (!members || !members.length) return;

    let data = members;
    data[index][key] = e.target.value;

    if (onUpdate) onUpdate(data);
  }

  addMember = (e) => {
    e.preventDefault();
    const { members, onUpdate } = this.props;
    if (!members || !members.length) return;

    let data = members;
    data[members.length] = {
      full_name: "",
      bio: "",
      // address: "",
      // city: "",
      // zip: "",
      // country: "",
    };

    if (onUpdate) onUpdate(data);
  };

  removeAtMember = (e, i = undefined) => {
    e.preventDefault();
    const { members, onUpdate } = this.props;
    if (!members || !members.length) return;

    let data = members;

    if (data.length < 2) {
      this.props.dispatch(showAlert("You need to have one member at least"));
      return;
    }
    if (i >= 0) {
      data.splice(i, 1);
    } else {
      data.pop();
    }
    if (onUpdate) onUpdate(data);
  };

  renderCountryDropDown(member, index) {
    const items = [];

    COUNTRYLIST.forEach((country, i) => {
      items.push(
        <option key={`option_${i}`} value={country}>
          {country}
        </option>
      );
    });

    return (
      <select
        value={member.country}
        onChange={(e) => this.updateData(e, index, "country")}
        required
      >
        <option value="">Select...</option>
        {items}
      </select>
    );
  }

  renderMembers() {
    const { members, allowDeleteItem } = this.props;
    const items = [];

    if (members && members.length) {
      members.forEach((member, index) => {
        items.push(
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div key={`member_${index}`} className="single-team-member">
              <div className="c-form-row">
                <label
                  style={{
                    color: "#9B64E6",
                    marginTop: "50px",
                    marginBottom: "50px",
                  }}
                >
                  <span className="pr-20">Team Member #{index + 1}:</span>
                  {allowDeleteItem && (
                    <Icon.Delete
                      style={{ cursor: "pointer" }}
                      size={20}
                      color="#7137ce"
                      onClick={(e) => this.removeAtMember(e, index)}
                    />
                  )}
                </label>
              </div>

              <div className="c-form-row">
                <label>Full Name</label>
                <input
                  type="text"
                  value={member.full_name}
                  onChange={(e) => this.updateData(e, index, "full_name")}
                  required
                />
              </div>

              <div className="c-form-row">
                <label>Education/Experience</label>
                <textarea
                  value={member.bio}
                  onChange={(e) => this.updateData(e, index, "bio")}
                  required
                ></textarea>
              </div>

              {/* <div className="c-form-row">
                <label>Address</label>
                <input
                  type="text"
                  value={member.address}
                  onChange={(e) => this.updateData(e, index, "address")}
                  required
                />
              </div>

              <div className="c-form-row">
                <div className="row">
                  <div className="col-md-4">
                    <label>Town / City</label>
                    <input
                      type="text"
                      value={member.city}
                      onChange={(e) => this.updateData(e, index, "city")}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={member.zip}
                      onChange={(e) => this.updateData(e, index, "zip")}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Country</label>
                    {this.renderCountryDropDown(member, index)}
                  </div>
                </div>
              </div> */}
            </div>
          </Fade>
        );
      });
    }

    return items;
  }

  render() {
    const { memberChecked } = this.props;
    return (
      <section id="proposal-team-section">
        <Fade distance={"20px"} bottom duration={100} delay={600}>
          <div className="c-form-row">
            <label>{`Please enter team member details for all central project members:`}</label>
          </div>
        </Fade>
        {this.renderMembers()}
        <Fade distance={"20px"} bottom duration={100} delay={600}>
          <div className="c-checkbox-item mt-5">
            <Checkbox
              value={memberChecked}
              text="I hereby declare that my team has sufficient qualifications, experience and capacity to actually finish the proposed project."
              onChange={(val) => this.toggleCheckbox(val)}
            />
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={100} delay={600}>
          <div className="new-proposal-button-wrap">
            <a className="btn btn-primary large" onClick={this.addMember}>
              <Icon.Plus style={{ marginRight: "5px" }} />
              Add Team Member
            </a>
            <a className="btn btn-danger large" onClick={this.removeAtMember}>
              <Icon.Minus style={{ marginRight: "5px" }} />
              Remove Team Member
            </a>
          </div>
        </Fade>
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalTeam);
