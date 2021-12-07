import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import {
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
  startInformalAdminTools,
  toggleEditMode,
} from "../../redux/actions";
import {
  forceWithdrawProposal,
  startInformalVotingShared,
} from "../../utils/Thunk";

import "./admin-tools.scss";

const mapStateToProps = () => {
  return {};
};

const ACTIONS = {
  edit: "Edit Proposal",
  withdraw: "Force Withdraw",
  startInformal: "Begin Informal Voting",
};

class AdminTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAction: null,
    };
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  confirmAction = (action) => {
    this.setState({
      currentAction: action,
    });
  };

  performAction = () => {
    const { proposalId } = this.props.data;
    const { history } = this.props;
    if (this.state.currentAction === "edit") {
      this.props.dispatch(toggleEditMode(true));
      this.hideModal();
    } else if (this.state.currentAction === "withdraw") {
      this.props.dispatch(
        forceWithdrawProposal(
          proposalId,
          () => {
            this.props.dispatch(showCanvas());
          },
          () => {
            this.props.dispatch(hideCanvas());
            this.hideModal();
            history.push("/app/discussions");
          }
        )
      );
    } else if (this.state.currentAction === "startInformal") {
      this.props.dispatch(
        startInformalVotingShared(
          proposalId,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            this.hideModal();
            this.props.dispatch(startInformalAdminTools(true));
            if (res.success) {
              this.props.dispatch(
                showAlert(
                  "Informal voting process has been started successfully",
                  "success"
                )
              );
            }
          }
        )
      );
    }
  };

  // Render Content
  render() {
    return (
      <div id="admin-tools-modal">
        {!this.state.currentAction ? (
          <ul>
            {Object.keys(ACTIONS).map((x, index) => (
              <li key={index}>
                <button
                  className="btn btn-primary"
                  onClick={() => this.confirmAction(x)}
                >
                  {ACTIONS[x]}
                </button>
              </li>
            ))}
            <li>
              <button
                className="btn btn-primary-outline"
                onClick={this.hideModal}
              >
                Cancel Admin Action
              </button>
            </li>
          </ul>
        ) : (
          <>
            <h4 className="pb-1">
              Are you sure you want to {ACTIONS[this.state.currentAction]}?
            </h4>
            <div className="actions">
              <button className="btn btn-primary" onClick={this.performAction}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={this.hideModal}>
                No
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AdminTools));
