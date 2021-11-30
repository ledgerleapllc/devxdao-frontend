import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import {
  hideCanvas,
  setActiveModal,
  setCustomModalData,
  showAlert,
  showCanvas,
} from "../../../../redux/actions";
import {
  startFormalMilestoneVotingUser,
  startFormalVotingShared,
} from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customModalData: state.global.customModalData,
  };
};

class InformalDone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forP: 0,
      againstP: 0,
    };
  }

  componentDidMount() {
    const { vote } = this.props;
    const for_value = parseInt(vote.for_value);
    const against_value = parseInt(vote.against_value);
    const total_value = for_value + against_value;

    let forP = 0;
    let againstP = 0;

    if (total_value) {
      forP = 100 * parseFloat(for_value / total_value);
      forP = parseInt(forP);
      againstP = 100 - forP;
    }

    this.setState({
      forP,
      againstP,
    });
  }

  componentDidUpdate(prevProps) {
    const { customModalData, onRefresh } = this.props;
    const { customModalData: customModalDataPrev } = prevProps;

    if (
      customModalDataPrev &&
      customModalDataPrev.revote &&
      (!customModalData || !customModalData.revote)
    ) {
      if (onRefresh) onRefresh();
    }
  }

  clickRevote = (e) => {
    const { vote } = this.props;
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        revote: {
          render: true,
          title: "You are restarting this vote",
          data: vote,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  startFormal = (e) => {
    e.preventDefault();
    const { proposal, onRefresh } = this.props;

    this.props.dispatch(
      startFormalVotingShared(
        proposal.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert(
                "Formal voting process has been started successfully",
                "success"
              )
            );
            if (onRefresh) onRefresh();
          }
        }
      )
    );
  };

  startFormalMilestoneVote = (vote) => {
    this.props.dispatch(
      startFormalMilestoneVotingUser(
        vote.proposal_id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert(
                "Formal voting process has been started successfully",
                "success"
              )
            );
          }
        }
      )
    );
  };

  renderAlert2() {
    const { authUser, vote, proposal } = this.props;
    if (
      vote.result == "success" &&
      vote.status == "completed" &&
      vote.type == "informal"
    ) {
      if (
        authUser.id == proposal.user_id &&
        proposal.onboarding &&
        proposal.onboarding.id
      ) {
        // OP
        const onboarding = proposal.onboarding;
        if (onboarding && onboarding.status == "pending") {
          return (
            <div className="app-simple-section mb-3">
              <div
                style={{ padding: 0 }}
                className="font-size-14 font-weight-700"
              >
                {`This proposal passed the informal vote stage. You need to submit your KYC, fill out the payment form, and esign the form sent to your email to move this to the formal vote. Go to the My Proposals tab and complete this in the upper table to complete these actions.`}
              </div>
            </div>
          );
        } else if (
          vote.type === "informal" &&
          vote.content_type == "milestone"
        ) {
          return (
            <div className="app-simple-section mb-3 align-items-center">
              <a
                style={{ width: "250px", marginRight: "30px" }}
                className="btn btn-primary btn-fluid less-small"
                onClick={() => this.startFormalMilestoneVote(vote)}
              >
                Start Formal Milestone Vote
              </a>
              <div
                style={{ padding: 0 }}
                className="font-size-14 font-weight-700"
              >
                {`Your Grant has completed the milestone informal vote. Please click the button to begin the formal vote.`}
              </div>
            </div>
          );
        }
      } else if (authUser.id == proposal.user_id && proposal.type == "simple") {
        return (
          <a
            className="btn btn-primary btn-fluid less-small mb-3"
            onClick={this.startFormal}
          >
            Start Formal Voting Process
          </a>
        );
      }
    }
    return null;
  }

  renderAlert() {
    const { authUser, vote, proposal } = this.props;
    if (vote.result == "no-quorum" && vote.status == "completed") {
      if (authUser.is_admin || authUser.id == proposal.user_id) {
        // Admin or OP
        return (
          <div className="app-simple-section mb-3">
            <div style={{ padding: 0 }}>
              <label className="font-size-14">{`This vote did not reach quorum. Not enough Voting Associates voted. Another vote is needed.`}</label>
              <a
                className="btn btn-primary small mt-2"
                onClick={this.clickRevote}
              >
                Revote
              </a>
            </div>
          </div>
        );
      }
    }
    return null;
  }

  render() {
    const { vote } = this.props;
    const { forP, againstP } = this.state;

    let link = `/app/proposal/${vote.proposal_id}/informal-vote`;
    if (vote.content_type == "milestone")
      link = `/app/proposal/${vote.proposal_id}/milestone-vote/${vote.id}`;

    return (
      <div id="app-spd-informal-done-wrap">
        {this.renderAlert()}
        {this.renderAlert2()}
        <div>
          <div className="app-simple-section">
            <label>
              Informal Vote Results:{" "}
              <Link
                to={link}
                style={{ fontSize: "14px" }}
                className="color-info"
              >
                <u>(view vote detail)</u>
              </Link>
            </label>
            <div className="vote-result-row">
              <span
                style={{ width: `${forP}%`, backgroundColor: "#33C333" }}
              ></span>
              <label>{forP}%</label>
            </div>
            <div className="vote-result-row">
              <span
                style={{ width: `${againstP}%`, backgroundColor: "#EA5454" }}
              ></span>
              <label>{againstP}%</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(InformalDone));
