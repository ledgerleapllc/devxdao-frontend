import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import * as Icon from "react-feather";
import {
  showAlert,
  setCustomModalData,
  setActiveModal,
} from "../../../../redux/actions";
import { DECIMALS } from "../../../../utils/Constant";
import {
  Checkbox,
  CheckboxX,
  Card,
  CardHeader,
  CardPreview,
  CardBody,
} from "../../../../components";
import { BALLOT_TYPES } from "../../../../utils/enum";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customModalData: state.global.customModalData,
    settings: state.global.settings,
  };
};

class Formal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stakeAmount: "",
      day: "00",
      hours: "00",
      min: "00",
      secs: "00",
      forP: 0,
      againstP: 0,
    };

    this.diff = 0;
    this.timer = null;
  }

  componentDidMount() {
    const { vote, informalVote, mins } = this.props;

    // Informal Vote Result
    const for_value = parseInt(informalVote.for_value);
    const against_value = parseInt(informalVote.against_value);
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

    // Timer Check
    this.diff = moment(vote.created_at)
      .add(mins, "minutes")
      .diff(moment(), "seconds");
    if (this.diff) {
      let secs = this.diff % 60;
      let min = parseInt(this.diff / 60);
      let hours = parseInt(min / 60);
      min = min % 60;
      let day = parseInt(hours / 24);
      hours = hours % 24;

      secs = secs.toString().padStart(2, "0");
      min = min.toString().padStart(2, "0");
      hours = hours.toString().padStart(2, "0");
      day = day.toString().padStart(2, "0");

      this.setState({ day, hours, min, secs }, () => {
        this.timer = setTimeout(() => {
          this.runTimer();
        }, 1000);
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { customModalData, onRefresh } = this.props;
    const { customModalData: customModalDataPrev } = prevProps;

    if (
      (!customModalData["vote-confirm"] ||
        !customModalData["vote-confirm"].render) &&
      customModalDataPrev["vote-confirm"] &&
      customModalDataPrev["vote-confirm"].render
    ) {
      if (onRefresh) onRefresh();
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  runTimer() {
    let { day, hours, min, secs } = this.state;
    secs = parseInt(secs);
    day = parseInt(day);
    hours = parseInt(hours);
    min = parseInt(min);

    if (day || hours || min || secs) {
      if (secs) secs--;
      else {
        if (min) {
          min--;
          secs = 59;
        } else {
          if (hours) {
            hours--;
            min = 59;
            secs = 59;
          } else {
            day--;
            hours = 23;
            min = 59;
            secs = 59;
          }
        }
      }

      secs = secs.toString().padStart(2, "0");
      min = min.toString().padStart(2, "0");
      hours = hours.toString().padStart(2, "0");
      day = day.toString().padStart(2, "0");

      this.setState({ day, hours, min, secs }, () => {
        this.timer = setTimeout(() => {
          this.runTimer();
        }, 1000);
      });
    }
  }

  submitVote(type) {
    let { stakeAmount, day, hours, min, secs } = this.state;
    const { proposal, vote, authUser, informalVote } = this.props;

    let rep = 0;
    let max = 0;
    if (authUser.profile.rep) rep = parseFloat(authUser.profile.rep);

    max = parseFloat(rep / 2);

    day = parseInt(day);
    hours = parseInt(hours);
    min = parseInt(min);
    secs = parseInt(secs);

    if (!day && !hours && !min && !secs) {
      this.props.dispatch(showAlert("You can't submit your vote"));
      return;
    }

    if (!stakeAmount.trim()) {
      this.props.dispatch(showAlert("Please input stake amount"));
      return;
    }

    const value = +stakeAmount;

    if (value <= 0 || value > max) {
      this.props.dispatch(
        showAlert(
          `Please input value greater than 0 to ${+max?.toFixed(DECIMALS)}`
        )
      );
      return;
    }

    const data = {
      rep,
      max,
      proposalId: proposal.id,
      voteId: vote.id,
      type,
      value,
      informalVote,
    };

    this.props.dispatch(
      setCustomModalData({
        "vote-confirm": {
          render: true,
          title: "This action will use your Reputation points.",
          data,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  inputStakeAmount = (e) => {
    let value = e.target.value;
    // if (value && isNaN(value)) value = "";
    // if (value) value = parseInt(value).toString();
    if (value && +value < 0) value = "";

    this.setState({ stakeAmount: value });
  };

  renderTitle() {
    const { proposal } = this.props;
    return (
      <label className="font-size-18 font-weight-700 mb-3 d-block">
        {proposal.title}
      </label>
    );
  }

  renderInfo() {
    const { authUser } = this.props;
    let rep = 0;
    let max = 0;
    if (authUser.profile.rep) rep = parseFloat(authUser.profile.rep);

    max = parseFloat(rep / 2);
    // max = Helper.adjustNumericString(max.toString(), 2);

    return (
      <div className="mt-3">
        <label className="d-block font-size-14">
          Available Reputation: <b>{rep?.toFixed?.(DECIMALS)}</b>
        </label>
        <label className="d-block font-size-14 mt-1">
          Max Reputation for Voting (50%): <b>{max?.toFixed?.(DECIMALS)}</b>
        </label>
      </div>
    );
  }

  renderForm() {
    const { stakeAmount } = this.state;
    const { proposal, vote, informalVote, authUser } = this.props;

    let voted = false;
    if (proposal.voteResults && proposal.voteResults.length) {
      for (let i in proposal.voteResults) {
        if (proposal.voteResults[i].vote_id == vote.id) {
          voted = true;
          break;
        }
      }
    }
    const isMilestoneVote = vote.content_type === "milestone";
    let isFormalVotingLive;
    if (isMilestoneVote) {
      isFormalVotingLive =
        proposal.status == "approved" &&
        proposal.votes.length > 1 &&
        vote.status == "active" &&
        vote.type == "formal";
    } else {
      isFormalVotingLive =
        proposal.status == "approved" &&
        proposal.votes.length > 1 &&
        proposal.votes[proposal.votes.length - 1].status == "active" &&
        proposal.votes[proposal.votes.length - 1].type == "formal";
    }
    if (+authUser.id === +proposal.user_id) {
      return (
        <form>
          <div className="ml-3" id="app-spd-informal-process-body">
            <label className="mb-2">Active tightly coupled vote</label>
            <br />
            <b>{`You are not able to vote in this ballot vote because this is your own proposal. You cannot vote for your own proposal.`}</b>
          </div>
        </form>
      );
    }
    if (!voted && authUser.id != proposal.user_id && authUser.is_member) {
      if (isFormalVotingLive) {
        let isVotedWhenInformal;
        if (isMilestoneVote) {
          isVotedWhenInformal = informalVote.results
            .map((x) => x.user_id)
            .includes(authUser.id);
        } else {
          isVotedWhenInformal = proposal.votes[
            proposal.votes.length - 2
          ].results
            .map((x) => x.user_id)
            .includes(authUser.id);
        }
        if (!isVotedWhenInformal) {
          return (
            <form>
              <div className="ml-3" id="app-spd-informal-process-body">
                <label className="mb-2">Active tightly coupled vote</label>
                <br />
                <b>{`You are not able to vote in this ballot because this is a formal vote and you did not vote during the informal stage of this ballot.`}</b>
              </div>
            </form>
          );
        }
      }
      return (
        <form action="" method="POST" onSubmit={(e) => e.preventDefault()}>
          <div id="app-spd-formal-process-header">
            <label>Active Tighly Coupled Vote</label>
            <Icon.Info size={16} />
          </div>
          <div id="app-spd-formal-process-body">
            {this.renderTitle()}
            <span className="spacer"></span>
            <label className="font-size-14 font-weight-700 mt-3">
              This proposal is now in the final voting process
            </label>
            <p className="font-size-12 mt-1">
              {`Tightly coupled votes affect reputation and those voting
              against the winning side will lose the reputation they staked
              towards the vote.`}
            </p>
            {this.renderInfo()}
            <input
              type="number"
              placeholder="Stake Amount"
              value={stakeAmount}
              onChange={this.inputStakeAmount}
            />
            <p className="font-size-12" style={{ maxWidth: "518px" }}>
              Please enter the amount of reputation you would like to stake.
              This will affect the weight of your vote and indicates how
              strongly you feel.
            </p>
            <div id="c-buttons-wrap">
              <button
                type="button"
                className="btn btn-success btn-fluid less-small"
                onClick={() => this.submitVote("for")}
              >
                Vote For
              </button>
              <button
                type="button"
                className="btn btn-danger btn-fluid less-small"
                onClick={() => this.submitVote("against")}
              >
                Vote Against
              </button>
            </div>
          </div>
        </form>
      );
    }

    return null;
  }

  renderMilestoneInfo() {
    const { proposal, vote } = this.props;
    if (vote.content_type != "milestone") return null;

    const milestones = proposal.milestones || [];
    const milestoneId = vote.milestone_id;

    let milestone = {};
    for (let i in milestones) {
      if (milestones[i].id == milestoneId) {
        milestone = milestones[i];
        break;
      }
    }
    const index = milestones.findIndex((x) => x.id === milestoneId);

    if (!milestone || !milestone.id) return null;

    return (
      <Fragment>
        <p className="font-size-14 mt-4">
          Milestone Information:
          <b>
            Milestone {index + 1} of {milestones?.length} - resubmission{" "}
            {milestone.time_submit}
          </b>
        </p>
        <p className="font-size-14 mt-4">
          Milestone Title: <b>{milestone.title}</b>
        </p>
        <p className="font-size-14 mt-2">
          Details: <b>{milestone.details}</b>
        </p>
        <p className="font-size-14 mt-2">
          Grant Portion: <b>{milestone.grant}</b>
        </p>
        <p className="font-size-14 mt-2">
          URL: <b>{milestone.url}</b>
        </p>
        <p className="font-size-14 mt-2">
          Comment: <b>{milestone.comment}</b>
        </p>
      </Fragment>
    );
  }

  renderVoteInfo() {
    const { proposal, settings, vote } = this.props;
    const formalVote = vote;

    let totalMembers = proposal.totalMembers || 0;
    totalMembers = parseInt(totalMembers);

    let quorum_rate = 0;
    if (formalVote.content_type == "grant")
      quorum_rate = settings.quorum_rate || 0;
    else if (
      ["simple", "admin-grant", "advance-payment"].includes(
        formalVote.content_type
      )
    )
      quorum_rate = settings.quorum_rate_simple || 0;
    else quorum_rate = settings.quorum_rate_milestone || 0;

    quorum_rate = parseFloat(quorum_rate);

    let minMembers = parseFloat((totalMembers * quorum_rate) / 100);
    minMembers = Math.ceil(minMembers);

    return (
      <div
        className="app-simple-section mt-3"
        style={{ flexDirection: "column" }}
      >
        <p className="font-size-14 text-capitalize">
          Formal Vote Type: <b>{BALLOT_TYPES[formalVote.content_type]}</b>
        </p>
        <p className="font-size-14 mt-2">
          This ballot requires <b>{quorum_rate}%</b> of Voting Associates to
          vote. <b>{minMembers}</b> Voting Associates must vote of the total{" "}
          <b>{totalMembers}</b> Voting Associates.{" "}
          <b>{formalVote.totalVotes}</b> have voted.
        </p>
        {this.renderMilestoneInfo()}
      </div>
    );
  }

  redirectActiveVote() {
    const { proposal, vote } = this.props;
    if (
      ["admin-grant", "grant", "simple", "advance-payment"].includes(
        vote.content_type
      )
    ) {
      this.props.history.push(`${proposal.id}/formal-vote`);
    } else if (vote.content_type === "milestone") {
      this.props.history.push(`${proposal.id}/milestone-vote/${vote.id}`);
    }
  }

  render() {
    const { day, hours, min, secs, forP, againstP } = this.state;
    const { informalVote, proposal, authUser, vote } = this.props;
    const currentMilestone = proposal?.milestones.find(
      (x) => x.id === vote.milestone_id
    );
    let data;
    if (currentMilestone?.milestone_review.length > 0) {
      data =
        currentMilestone?.milestone_review[
          currentMilestone?.milestone_review?.length - 1
        ];
    }
    let link = `/app/proposal/${informalVote.proposal_id}/informal-vote`;
    if (informalVote.content_type == "milestone")
      link = `/app/proposal/${informalVote.proposal_id}/milestone-vote/${informalVote.id}`;
    return (
      <div id="app-spd-formal-process-wrap">
        <div className="d-flex justify-content-end mb-3 ">
          {!!authUser.is_admin && (
            <button
              type="button"
              className="btn btn-primary btn-fluid less-small"
              onClick={() => this.redirectActiveVote()}
            >
              Admin Active Vote Viewer
            </button>
          )}
        </div>
        <div>
          <article className="app-simple-section">
            <label>Time Remaining in vote:</label>
            <div>
              <span>{day}</span>
              <label>day</label>
              <span>{hours}</span>
              <label>hours</label>
              <span>{min}</span>
              <label>min</label>
              <span>{secs}</span>
              <label>sec</label>
            </div>
          </article>
          <div className="app-simple-section">
            <label>
              Informal Vote Results:{" "}
              <Link
                className="color-info"
                to={link}
                style={{ fontSize: "14px" }}
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
        {this.renderVoteInfo()}
        {this.renderForm()}
        {vote.content_type === "milestone" && data?.milestone_check_list && (
          <Card className="mt-3 mw-100" isAutoExpand>
            <CardHeader>
              <div
                className="app-simple-section__titleInner w-100"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div>
                  <label className="pr-2">Applicant checklist</label>
                  <Icon.Info size={16} />
                </div>
              </div>
            </CardHeader>
            <CardPreview>
              <div className="py-2">
                <CheckboxX
                  value={
                    +data?.milestone_check_list?.appl_accepted_corprus &&
                    +data?.milestone_check_list?.appl_accepted_definition &&
                    +data?.milestone_check_list?.appl_accepted_pm &&
                    +data?.milestone_check_list?.appl_attests_accounting &&
                    +data?.milestone_check_list?.appl_attests_criteria &&
                    +data?.milestone_check_list?.appl_submitted_corprus
                      ? 1
                      : 0
                  }
                  text={`Application Checklist`}
                  readOnly
                />
              </div>
              <div className="py-2">
                <CheckboxX
                  value={
                    +data?.milestone_check_list?.pm_submitted_evidence &&
                    +data?.milestone_check_list?.pm_submitted_admin &&
                    +data?.milestone_check_list?.pm_verified_crdao &&
                    +data?.milestone_check_list?.pm_verified_corprus &&
                    +data?.milestone_check_list?.pm_verified_subs
                      ? 1
                      : 0
                  }
                  text={`Program Management Checklist`}
                  readOnly
                />
              </div>
              <div className="py-2">
                <CheckboxX
                  value={
                    +data?.milestone_check_list?.crdao_acknowledged_project &&
                    +data?.milestone_check_list?.crdao_accepted_pm &&
                    +data?.milestone_check_list?.crdao_acknowledged_receipt &&
                    +data?.milestone_check_list?.crdao_submitted_review &&
                    +data?.milestone_check_list?.crdao_submitted_subs
                      ? 1
                      : 0
                  }
                  text={`Expert Dao (CR Dao) checklist`}
                  readOnly
                />
              </div>
            </CardPreview>
            <CardBody>
              <div className="pt-4">
                <div>
                  <Checkbox
                    value={true}
                    text={`All attestations accepted on ${moment(
                      data?.milestone_check_list?.created_at
                    ).format("M/D/YYYY")}`}
                    readOnly
                  />
                  <h6 className="mt-5">Expert Dao (CR Dao) checklist:</h6>
                  <div className="my-3">
                    <CheckboxX
                      value={
                        +data?.milestone_check_list?.crdao_acknowledged_project
                      }
                      text={`Expert Dao (CR Dao) has acknowledged the project Definition of Done? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {
                        data?.milestone_check_list
                          ?.crdao_acknowledged_project_notes
                      }
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.crdao_accepted_pm}
                      text={`Expert Dao (CR Dao) has accepted the Program Management T&C? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.crdao_accepted_pm_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={
                        +data?.milestone_check_list?.crdao_acknowledged_receipt
                      }
                      text={`Expert Dao (CR Dao) has acknowledged receipt of the corpus of work? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {
                        data?.milestone_check_list
                          ?.crdao_acknowledged_receipt_notes
                      }
                    </p>
                  </div>
                  <div className="my-3">
                    <label className="padding-notes">
                      Program management has valid response from Expert Dao?
                      <b className="pr-2">
                        {data?.milestone_check_list?.crdao_valid_respone}
                      </b>
                      {moment(data?.milestone_check_list?.created_at).format(
                        "M/D/YYYY"
                      )}
                    </label>
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.crdao_valid_respone_note}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={
                        +data?.milestone_check_list?.crdao_submitted_review
                      }
                      text={`Expert Dao (CR Dao) has submitted a review of the corpus of work? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.crdao_submitted_review_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.crdao_submitted_subs}
                      text={`Expert Dao (CR Dao) has acknowledged the project Definition of Done? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.crdao_submitted_subs_notes}
                    </p>
                  </div>
                  <h6 className="mt-5">Program Management checklist:</h6>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.pm_submitted_evidence}
                      text={`Expert Dao (CR Dao) Program Management has submitted the Evidence of Work location? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.pm_submitted_evidence_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.pm_submitted_admin}
                      text={`Expert Dao (CR Dao) Program Management has submitted Administrator notes? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.pm_submitted_admin_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.pm_verified_crdao}
                      text={`Program Management has verified corpus existence? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.pm_verified_corprus_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.pm_verified_crdao}
                      text={`Program Management has verified Expert Dao (CR Dao)'s review exists? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.pm_verified_crdao_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <CheckboxX
                      value={+data?.milestone_check_list?.pm_verified_subs}
                      text={`Program Management has verified Expert Dao (CR Dao) substantiation (voting record) existence? ${moment(
                        data?.milestone_check_list?.created_at
                      ).format("M/D/YYYY")}`}
                      readOnly
                    />
                    <p className="padding-notes">
                      Notes:{" "}
                      {data?.milestone_check_list?.pm_verified_subs_notes}
                    </p>
                  </div>
                  <div className="my-3">
                    <p className="padding-notes">
                      Other general reviewer notes:
                      <span className="pl-2">
                        {data?.milestone_check_list?.addition_note}
                      </span>
                    </p>
                  </div>
                  <div className="my-3">
                    <p className="padding-notes">
                      Program manager review submission timestamp:
                      <span className="pl-2">
                        {moment(data?.reviewed_at).format("M/D/YYYY")}
                      </span>
                    </p>
                  </div>
                  <div className="my-3">
                    <p className="padding-notes">
                      Program manager reviewer email:
                      <span className="pl-2">{data?.user?.email}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Formal));
