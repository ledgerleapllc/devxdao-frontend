import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { showAlert, showCanvas, hideCanvas } from "../../../../redux/actions";
import { startInformalVotingShared } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
  };
};

class StartInformal extends Component {
  startInformal = (e) => {
    if (e) e.preventDefault();
    const { proposal, onRefresh } = this.props;

    this.props.dispatch(
      startInformalVotingShared(
        proposal.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert(
                "Informal voting process has been started successfully",
                "success"
              )
            );
            if (onRefresh) onRefresh();
          }
        }
      )
    );
  };

  renderButton() {
    const { authUser, proposal, settings } = this.props;
    const className = proposal.pendingChangeCount
      ? "btn btn-primary btn-fluid less-small disabled"
      : "btn btn-primary btn-fluid less-small";

    return (
      <Fragment>
        {proposal.pendingChangeCount ? (
          <p className="color-danger">
            You must approve or deny {proposal.pendingChangeCount} changes
            before starting the vote.
          </p>
        ) : (
          <>
            {settings.gate_new_grant_votes === "yes" ? (
              <p>
                {`Your proposal has passed the required discussion time period but needs approval from the DEVxDAO Voting Member community to start the voting process. Please join us on telegram anytime or join the Jitsi call on Mondays at 5PM UTC to request approval.`}
              </p>
            ) : (
              <p>
                {`All conditions have been met to start the voting process. Would you like to lock discussion and begin voting?`}
              </p>
            )}
          </>
        )}
        {!!authUser.is_admin && (
          <a className={className} onClick={this.startInformal}>
            Begin Informal Voting
          </a>
        )}
        {!authUser.is_admin && settings.gate_new_grant_votes === "no" && (
          <a className={className} onClick={this.startInformal}>
            Start Informal Voting Process
          </a>
        )}
        {!authUser.is_admin && settings.gate_new_grant_votes === "yes" && (
          <>
            <a
              className={`btn-telegram mr-2 ${className}`}
              href="https://t.me/devxdao"
            >
              Go to Telegram
            </a>
            <a className={className} href="https://jitsi.devdao.ch/va">
              Join Jitsi (only live 5pm UTC Mondays)
            </a>
          </>
        )}
      </Fragment>
    );
  }

  render() {
    const { authUser, proposal } = this.props;
    if (!authUser || !authUser.id || !proposal || !proposal.id) return null;
    return (
      <div id="app-spd-informal-start-wrap">
        <div>{this.renderButton()}</div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(StartInformal));
