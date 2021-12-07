import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { RELATIONSHIPS } from "../../../../utils/Constant";

import "./proposal-relation.scss";

const mapStateToProps = () => {
  return {};
};

class ProposalRelation extends Component {
  toggle(index) {
    let { relationship, onUpdate } = this.props;

    if (relationship.includes(index)) {
      // Uncheck
      const elemIndex = relationship.indexOf(index);
      relationship.splice(elemIndex, 1);
    } else {
      // Check
      if (index == RELATIONSHIPS.length - 1) relationship = [];
      else if (relationship.includes(RELATIONSHIPS.length - 1)) {
        const elemIndex = relationship.indexOf(RELATIONSHIPS.length - 1);
        relationship.splice(elemIndex, 1);
      }

      relationship.push(index);
    }

    if (onUpdate) onUpdate(relationship);
  }

  renderRelations() {
    const { relationship } = this.props;

    const items = [];

    RELATIONSHIPS.forEach((relation, index) => {
      const checked = relationship.includes(index) ? true : false;

      items.push(
        <div key={`relation_${index}`} className="c-checkbox-item">
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
          <label onClick={() => this.toggle(index)}>{relation}</label>
        </div>
      );
    });

    return items;
  }

  render() {
    return (
      <section id="proposal-relation-section">
        <div className="c-form-row">
          <label>{`Please outline your relationship with ETA and Contributors of ETA:`}</label>
        </div>
        <div className="c-form-row">{this.renderRelations()}</div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(ProposalRelation);
