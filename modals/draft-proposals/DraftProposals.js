import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { removeActiveModal } from "../../redux/actions";
import { withRouter } from "react-router-dom";
import DraftProposalsTable from "./components/DraftProposalsTable";

import "./draft-proposals.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class DraftProposals extends Component {
  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  newGrant = () => {
    const { history } = this.props;
    this.hideModal();
    history.push("/app/proposal/new");
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="draft-proposals-modal">
        <div className="custom-modal-close" onClick={this.hideModal}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h5 className="text-center mt-5 mb-4">
          Would you like to continue a prior grant application or start a new
          application?
        </h5>
        <DraftProposalsTable />
        <div className="mt-4" id="draft-proposals-modal__buttons">
          <a className="btn btn-primary" onClick={this.newGrant}>
            Start a new grant instead
          </a>
          <a
            className="color-primary text-underline mt-2"
            onClick={this.hideModal}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DraftProposals));
