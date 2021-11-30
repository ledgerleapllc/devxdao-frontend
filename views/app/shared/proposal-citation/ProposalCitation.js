import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { checkProposalId } from "../../../../utils/Thunk";
import { hideCanvas, showCanvas } from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";

import "./proposal-citation.scss";

const mapStateToProps = () => {
  return {};
};

class ProposalCitation extends Component {
  updateData(e, index, key) {
    const { citations, onUpdate } = this.props;
    if (!citations || !citations.length) return;

    let data = citations;
    data[index][key] = e.target.value;

    if (onUpdate) onUpdate(data);
  }

  updatePercentageData(e, index, key) {
    const { citations, onUpdate } = this.props;
    if (!citations || !citations.length) return;

    let data = citations;

    let value = e.target.value;
    value = Helper.unformatPercentage(value);
    if (value && isNaN(value)) value = "";
    if (value) value = parseInt(value).toString();
    if (value && parseInt(value) < 0) value = "";
    if (value && parseInt(value) > 100) value = "";

    data[index][key] = value;
    if (onUpdate) onUpdate(data);
  }

  updateIntData(e, index, key) {
    const { citations, onUpdate } = this.props;
    if (!citations || !citations.length) return;

    let data = citations;

    let value = e.target.value;
    if (value && isNaN(value)) value = "";
    if (value) value = parseInt(value).toString();
    if (value && parseInt(value) < 0) value = "";

    data[index][key] = value;
    if (key == "proposalId") {
      data[index]["validProposal"] = false;
      data[index]["checked"] = false;
      data[index]["proposal"] = {};
    }

    if (onUpdate) onUpdate(data);
  }

  checkProposal(index) {
    const { citations, onUpdate } = this.props;
    if (!citations || !citations.length) return;

    let data = citations;
    const proposalId = data[index].proposalId || "";

    if (!proposalId) {
      data[index]["validProposal"] = false;
      data[index]["checked"] = false;
      data[index]["proposal"] = {};
      if (onUpdate) onUpdate(data);
    } else {
      this.props.dispatch(
        checkProposalId(
          proposalId,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            data[index]["validProposal"] = res.success;
            data[index]["checked"] = true;
            data[index]["proposal"] = res.proposal || {};
            if (onUpdate) onUpdate(data);
          }
        )
      );
    }
  }

  renderItemAlert(citation) {
    if (citation.checked) {
      if (citation.validProposal) {
        return (
          <div className="mb-4">
            <p className="text-success font-size-14">
              This proposal is valid. Prior work title is{" "}
              <b>{citation.proposal?.title}</b>. OP is{" "}
              <b>{citation.proposal?.user?.profile?.forum_name}</b>.
            </p>
          </div>
        );
      } else {
        return (
          <p className="text-danger font-size-14 mb-4">
            This proposal is invalid
          </p>
        );
      }
    }
    return null;
  }

  renderItems() {
    const { citations } = this.props;
    const items = [];

    if (citations && citations.length) {
      citations.forEach((citation, index) => {
        items.push(
          <div key={`citation_${index}`} className="single-citation-item">
            <div className="c-form-row">
              <label className="mt-5 mb-5" style={{ color: "#9B64E6" }}>
                Citation #{index + 1}:
              </label>
            </div>
            <div className="c-form-row">
              <label>
                Enter the proposal number of work you would like to cite
              </label>
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="text"
                    value={citation.proposalId}
                    onChange={(e) => this.updateIntData(e, index, "proposalId")}
                    required
                  />
                </div>
                <div className="col-md-8">
                  <a
                    className="btn btn-primary small btn-fluid-small"
                    onClick={() => this.checkProposal(index)}
                  >
                    Check Proposal
                  </a>
                </div>
              </div>
            </div>
            {this.renderItemAlert(citation)}
            <div className="c-form-row">
              <label>Explain how this work is foundational to your work</label>
              <textarea
                value={citation.explanation}
                onChange={(e) => this.updateData(e, index, "explanation")}
                required
              ></textarea>
            </div>
            <div className="c-form-row">
              <label>{`What % of the rep gained from this proposal do you wish to give to the OP of the prior work`}</label>
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="text"
                    value={Helper.formatPercentage(citation.percentage)}
                    onChange={(e) =>
                      this.updatePercentageData(e, index, "percentage")
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );
      });
    }

    return items;
  }

  renderAlert() {
    const { citations, checkCustomSum } = this.props;
    let maxSum = 100;
    let sum = 0;
    if (checkCustomSum) {
      maxSum = checkCustomSum;
    }

    if (citations) {
      citations.forEach((citation) => {
        if (citation.percentage) sum += parseInt(citation.percentage);
      });
    }

    if (sum <= maxSum) return null;

    return (
      <div className="c-form-row mt-4">
        <p className="color-danger">{`Sum of the percentage can not be higher than 100%`}</p>
      </div>
    );
  }

  addItem = (e) => {
    e.preventDefault();
    const { citations, onUpdate } = this.props;

    let data = citations;
    data.push({
      proposalId: "",
      explanation: "",
      percentage: "",
      validProposal: false,
      checked: false,
      proposal: {},
    });

    if (onUpdate) onUpdate(data);
  };

  removeItem = (e) => {
    e.preventDefault();
    const { citations, onUpdate } = this.props;
    if (!citations || !citations.length) return;

    let data = citations;
    if (data.length <= 1) data = [];
    else data.pop();

    if (onUpdate) onUpdate(data);
  };

  render() {
    const { citations } = this.props;
    return (
      <section id="proposal-citation-section">
        <div className="c-form-row mt-5">
          <label>{`Please cite any previous work anyone else performed that is foundational to your proposed project.`}</label>
          <p className="font-size-14">{`(If your grant uses any part of work built by another grant holder, you must cite them here and assign a % of the minted rep to them. You may choose this %.)`}</p>
        </div>
        {this.renderItems()}

        {this.props.showAction && (
          <div className="new-proposal-button-wrap">
            <a className="btn btn-primary large" onClick={this.addItem}>
              <Icon.Plus style={{ marginRight: "5px" }} />
              Add Citation
            </a>
            {citations && citations.length ? (
              <a className="btn btn-danger large" onClick={this.removeItem}>
                <Icon.Minus style={{ marginRight: "5px" }} />
                Remove Citation
              </a>
            ) : null}
          </div>
        )}

        {this.renderAlert()}
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalCitation);
