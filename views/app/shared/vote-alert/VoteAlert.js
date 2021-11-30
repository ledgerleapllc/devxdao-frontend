import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import StartInformalView from "./StartInformal";
import InformalView from "./Informal";
import InformalDoneView from "./InformalDone";
import FormalView from "./Formal";
import FormalDoneView from "./FormalDone";
import qs from "qs";
import "./vote-alert.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
  };
};

class VoteAlert extends Component {
  renderContent() {
    const { settings, authUser, proposal, onRefresh } = this.props;
    const {
      location: { search },
    } = this.props;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    const milestoneId = query.milestone_id;

    // Proposal Check
    if (proposal.status != "approved" && proposal.status != "completed")
      return null;

    // Settings Check
    if (
      !settings.time_before_op_informal ||
      !settings.time_unit_before_op_informal ||
      !settings.time_before_op_informal_simple ||
      !settings.time_unit_before_op_informal_simple ||
      !settings.can_op_start_informal
    )
      return null;

    if (!proposal.votes || !proposal.votes.length) {
      // No Votes
      let mins = 0;
      if (proposal.type == "grant") {
        if (settings.time_unit_before_op_informal == "min")
          mins = parseInt(settings.time_before_op_informal);
        else if (settings.time_unit_before_op_informal == "hour")
          mins = parseInt(settings.time_before_op_informal) * 60;
        else if (settings.time_unit_before_op_informal == "day")
          mins = parseInt(settings.time_before_op_informal) * 24 * 60;
      } else if (
        ["simple", "admin-grant", "advance-payment"].includes(proposal.type)
      ) {
        if (settings.time_unit_before_op_informal_simple == "min")
          mins = parseInt(settings.time_before_op_informal_simple);
        else if (settings.time_unit_before_op_informal_simple == "hour")
          mins = parseInt(settings.time_before_op_informal_simple) * 60;
        else if (settings.time_unit_before_op_informal_simple == "day")
          mins = parseInt(settings.time_before_op_informal_simple) * 24 * 60;
      }

      const diff = moment(proposal.approved_at + ".000Z")
        .add(mins, "minutes")
        .diff(moment());

      if (diff <= 0 && authUser.is_admin) {
        // Admin can start informal voting
        return <StartInformalView proposal={proposal} onRefresh={onRefresh} />;
      }

      if (
        diff <= 0 &&
        settings.can_op_start_informal == "yes" &&
        authUser.id == proposal.user_id
      ) {
        // OP can start informal voting
        return <StartInformalView proposal={proposal} onRefresh={onRefresh} />;
      }
    } else if (proposal.votes.length == 1) {
      // Informal Voting Already Started
      const informalVote = proposal.votes[0];
      let mins = 0;
      if (informalVote.content_type == "grant") {
        if (settings.time_unit_informal == "min")
          mins = parseInt(settings.time_informal);
        else if (settings.time_unit_informal == "hour")
          mins = parseInt(settings.time_informal) * 60;
        else if (settings.time_unit_informal == "day")
          mins = parseInt(settings.time_informal) * 24 * 60;
      } else if (
        ["simple", "admin-grant", "advance-payment"].includes(
          informalVote.content_type
        )
      ) {
        if (settings.time_unit_simple == "min")
          mins = parseInt(settings.time_simple);
        else if (settings.time_unit_simple == "hour")
          mins = parseInt(settings.time_simple) * 60;
        else if (settings.time_unit_simple == "day")
          mins = parseInt(settings.time_simple) * 24 * 60;
      }

      let diff = moment(informalVote.created_at)
        .add(mins, "minutes")
        .diff(moment());
      if (diff > 0 && informalVote.status == "active") {
        return (
          <InformalView
            vote={informalVote}
            mins={mins}
            proposal={proposal}
            onRefresh={onRefresh}
          />
        );
      } else
        return (
          <InformalDoneView
            onRefresh={onRefresh}
            vote={informalVote}
            proposal={proposal}
          />
        );
    } else if (proposal.votes.length == 2) {
      // Formal Voting Already Started
      const informalVote = proposal.votes[0];
      const formalVote = proposal.votes[1];

      let mins = 0;
      if (formalVote.content_type == "grant") {
        if (settings.time_unit_formal == "min")
          mins = parseInt(settings.time_formal);
        else if (settings.time_unit_formal == "hour")
          mins = parseInt(settings.time_formal) * 60;
        else if (settings.time_unit_formal == "day")
          mins = parseInt(settings.time_formal) * 24 * 60;
      } else if (
        ["simple", "admin-grant", "advance-payment"].includes(
          formalVote.content_type
        )
      ) {
        if (settings.time_unit_simple == "min")
          mins = parseInt(settings.time_simple);
        else if (settings.time_unit_simple == "hour")
          mins = parseInt(settings.time_simple) * 60;
        else if (settings.time_unit_simple == "day")
          mins = parseInt(settings.time_simple) * 24 * 60;
      }

      let diff = moment(formalVote.created_at)
        .add(mins, "minutes")
        .diff(moment());

      if (diff > 0 && formalVote.status == "active") {
        return (
          <FormalView
            informalVote={informalVote}
            vote={formalVote}
            mins={mins}
            proposal={proposal}
            onRefresh={onRefresh}
          />
        );
      } else
        return (
          <FormalDoneView
            vote={formalVote}
            proposal={proposal}
            onRefresh={onRefresh}
          />
        );
    } else if (proposal.votes.length > 2) {
      // Milestone Votes
      let milestoneVote;
      let milestoneVotes;
      if (milestoneId) {
        milestoneVotes = proposal.votes.filter(
          (x) => x.milestone_id == milestoneId
        );
        milestoneVote = milestoneVotes[milestoneVotes.length - 1];
      } else {
        milestoneVote = proposal.votes[proposal.votes.length - 1];
        milestoneVotes = proposal.votes.filter(
          (x) => x.milestone_id == milestoneVote.milestone_id
        );
      }
      let mins = 0;
      if (milestoneVote.content_type == "milestone") {
        if (settings.time_unit_milestone == "min")
          mins = parseInt(settings.time_milestone);
        else if (settings.time_unit_milestone == "hour")
          mins = parseInt(settings.time_milestone) * 60;
        else if (settings.time_unit_milestone == "day")
          mins = parseInt(settings.time_milestone) * 24 * 60;
      }

      let diff = moment(milestoneVote.created_at)
        .add(mins, "minutes")
        .diff(moment());

      if (diff > 0 && milestoneVote.status == "active") {
        if (milestoneVote.type == "informal") {
          return (
            <InformalView
              vote={milestoneVote}
              mins={mins}
              proposal={proposal}
              onRefresh={onRefresh}
            />
          );
        } else {
          const informalVote = milestoneVotes[0];
          return (
            <FormalView
              informalVote={informalVote}
              vote={milestoneVote}
              mins={mins}
              proposal={proposal}
              onRefresh={onRefresh}
            />
          );
        }
      } else {
        if (milestoneVote.type == "informal")
          return (
            <InformalDoneView
              vote={milestoneVote}
              proposal={proposal}
              onRefresh={onRefresh}
            />
          );
        else
          return (
            <FormalDoneView
              vote={milestoneVote}
              proposal={proposal}
              onRefresh={onRefresh}
            />
          );
      }
    }

    return null;
  }

  render() {
    const { proposal } = this.props;
    if (!proposal || !proposal.id) return null;

    return (
      <section id="app-single-proposal-vote-section">
        {this.renderContent()}
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(VoteAlert));
