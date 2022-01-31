import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import classNames from "classnames";
import * as Icon from "react-feather";
import moment from "moment";
import {
  showCanvas,
  hideCanvas,
  startInformalAdminTools,
} from "../../../../redux/actions";
import {
  getSingleProposal,
  getTimelineProposal,
} from "../../../../utils/Thunk";
import SingleProposalDetailView from "../../shared/single-proposal-detail/SingleProposalDetail";
import VoteAlertView from "../../shared/vote-alert/VoteAlert";
import {
  CardBody,
  CardHeader,
  Card,
  PageHeaderComponent,
  Checkbox,
  CheckboxX,
} from "../../../../components";
import IconDot from "../../../../public/icons/dot.svg";
import IconEmptyDot from "../../../../public/icons/empty-dot.svg";
import IconCheckDot from "../../../../public/icons/check-dot.svg";
import "./single-proposal.scss";
import Helper from "../../../../utils/Helper";
import ProposalPosts from "../../shared/proposal-posts/ProposalPosts";
import { CircularProgressbar } from "react-circular-progressbar";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    startInformalAdmin: state.admin.startInformalAdmin,
    attestationData: state.user.attestationData,
  };
};

const findTrackingItem = (trackings, key) => {
  const item = trackings.find((x) => x.key === key);
  return {
    status: !!item,
    datetime: item
      ? moment(item.created_at).local().format("M/D/YYYY")
      : "--/--/----",
  };
};

const showWinner = (trackings, key) => {
  const item = trackings.find((x) => x.key === key);
  if (item) {
    return {
      title: item.event,
      status: !!item,
      datetime: item
        ? moment(item.created_at).local().format("M/D/YYYY")
        : "--/--/----",
    };
  }
  return null;
};

const showCompliance = (trackings, key, title) => {
  // const isPassInformalVote = trackings.find(
  //   (x) => x.key === "informal_vote_started"
  // );
  const item = trackings.find((x) => x.key === key);
  // if (isPassInformalVote) {
  return {
    title: title,
    status: !!item,
    datetime: item
      ? moment(item.created_at).local().format("M/D/YYYY")
      : "--/--/----",
  };
  // } else {
  //   return {
  //     title: title,
  //     status: !!item,
  //     datetime: item
  //       ? moment(item.created_at).local().format("M/D/YYYY")
  //       : "--/--/----",
  //   };
  // }
};

const generateTimelineMilestones = (proposal, trackings) => {
  const milestones = [];
  proposal?.milestones?.forEach((x, index) => {
    milestones.push(
      ...[
        {
          title: `Milestone ${index + 1} submitted`,
          ...findTrackingItem(trackings, `milestone_${index + 1}_submitted`),
        },
        {
          title: `Milestone ${index + 1} approved by CR DAO`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_approved_crdao`
          ),
        },
        {
          title: `Milestone ${index + 1} approved by Proj. Mngmt.`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_approved_proj`
          ),
        },
        {
          title: `Milestone ${index + 1} started informal vote`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_started_informal_vote`
          ),
        },
        {
          title: `Milestone ${index + 1} passed informal vote`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_passed_informal_vote`
          ),
        },
        {
          title: `Milestone ${index + 1} started formal vote`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_started_formal_vote`
          ),
        },
        {
          title: `Milestone ${index + 1} passed formal vote`,
          ...findTrackingItem(
            trackings,
            `milestone_${index + 1}_passed_formal_vote`
          ),
        },
      ]
    );
  });
  return milestones;
};

const generateTimeline = (proposal, trackings) => {
  const baseArr = [
    {
      title: `Proposal ${proposal.id} submitted`,
      datetime: moment(proposal.created_at).local().format("M/D/YYYY"),
    },
    {
      title: `Approved by admin`,
      ...findTrackingItem(trackings, "approved_by_admin"),
    },
    {
      title: `Entered discussion phase`,
      ...findTrackingItem(trackings, "discussion_phase"),
    },
    showWinner(trackings, "passed_survey_spot"),
    {
      title: `Informal vote started`,
      ...findTrackingItem(trackings, "informal_vote_started"),
    },
    {
      title: `Informal vote passed`,
      ...findTrackingItem(trackings, "informal_vote_passed"),
    },
    showCompliance(trackings, "kyc_checks_complete", "KYC checks complete"),
    showCompliance(
      trackings,
      "eta_compliance_complete",
      "ETA compliance complete"
    ),
    {
      title: `Entered Formal vote`,
      ...findTrackingItem(trackings, "entered_formal_vote"),
    },
    {
      title: `Passed Formal vote`,
      ...findTrackingItem(trackings, "passed_formal_vote"),
    },
    {
      title: `Grant activated by ETA`,
      ...findTrackingItem(trackings, "grant_activated"),
    },
    ...generateTimelineMilestones(proposal, trackings),
    {
      title: `Grant 100% complete`,
      ...findTrackingItem(trackings, "grant_completed"),
    },
  ];
  return baseArr.filter((x) => !!x);
};

class SingleProposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: {},
      proposalId: 0,
      loading: false,
      showForm: false,
      isShowLogs: true,
      expandTimeline: true,
      timelineList: [],
    };
  }
  componentDidMount() {
    this.setState({ loading: true });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.startInformalAdmin &&
      this.props.startInformalAdmin !== prevProps.startInformalAdmin
    ) {
      this.props.dispatch(startInformalAdminTools(false));
      this.getProposal();
    }

    if (this.state.proposalId != this.props.match.params.proposalId) {
      this.setState({ proposalId: this.props.match.params.proposalId }, () => {
        this.getProposal();
      });
    }
  }

  // Get Proposal
  getProposal = () => {
    const { proposalId } = this.state;

    this.props.dispatch(
      getSingleProposal(
        proposalId,
        () => {
          this.setState({ loading: true });
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const proposal = res.proposal || {};
          proposal.milestones = proposal.milestones?.map((x) => ({
            ...x,
            checked: true,
          }));
          this.props.dispatch(
            getTimelineProposal(
              proposalId,
              {},
              () => {},
              (res) => {
                if (res.success) {
                  this.setState({
                    loading: false,
                    proposalId,
                    proposal,
                    timelineList: generateTimeline(proposal, res.trackings),
                  });
                }
              }
            )
          );
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  // Cancel Form
  cancelForm = () => {
    this.setState({ showForm: false });
  };

  // Show Form
  showForm = () => {
    this.setState({ showForm: true });
  };

  // Render Header
  renderHeader() {
    const { authUser } = this.props;
    const { proposal } = this.state;
    if (!authUser || !authUser.id || !proposal || !proposal.id) return null;

    const title = proposal.title;
    if (authUser.is_admin) {
      // Admin
      if (proposal.status == "pending") {
        if (proposal.type == "grant") {
          return (
            <PageHeaderComponent
              title={title}
              buttonData={{
                link: `/app/proposal/${proposal.id}/edit`,
                text: "Edit Proposal",
              }}
            />
          );
        } else if (proposal.type == "simple") {
          return (
            <PageHeaderComponent
              title={title}
              buttonData={{
                link: `/app/simple-proposal/${proposal.id}/edit`,
                text: "Edit Simple Proposal",
              }}
            />
          );
        }
      }
    }
    // Not Admin
    return <PageHeaderComponent title={title} />;
  }

  // Render Detail
  renderDetail() {
    const { proposal } = this.state;
    return (
      <SingleProposalDetailView
        isAutoExpand={
          proposal.status === "approved" &&
          !(proposal.votes && proposal.votes.length)
        }
        proposal={proposal}
        refreshLogs={this.handleRefreshLogs}
        allowEdit
      />
    );
  }

  handleRefreshLogs = () => {
    this.setState({
      ...this.state,
      isShowLogs: false,
    });
    setTimeout(() => {
      this.setState({
        ...this.state,
        isShowLogs: true,
      });
    }, 200);
  };

  renderComplianceStatus = () => {
    const { proposal } = this.state;
    if (
      proposal?.onboarding?.force_to_formal &&
      proposal?.onboarding?.compliance_status === "approved"
    ) {
      return "manually approved";
    } else {
      return proposal?.onboarding?.compliance_status;
    }
  };

  renderComplianceCheck = () => {
    const { proposal } = this.state;
    return (
      <div className="mb-5">
        <Card>
          <CardHeader>
            <label className="pr-2">Compliance Check</label>
          </CardHeader>
          <CardBody>
            <div className="mt-3">
              <div>
                <label className="pr-2">Status:</label>
                <b className="text-capitalize">
                  {this.renderComplianceStatus()}
                </b>
              </div>
              <div>
                <label className="pr-2">Admin email:</label>
                <b>{proposal?.onboarding?.admin_email}</b>
              </div>
              <div>
                <label className="pr-2">Timestamp:</label>
                <b>
                  {moment(proposal?.onboarding?.compliance_reviewed_at)
                    .local()
                    .format("HH:mm M/D/YYYY")}
                </b>
              </div>
              {proposal?.onboarding?.deny_reason && (
                <div>
                  <label className="pr-2">Denied Reason:</label>
                  <b>{proposal?.onboarding?.deny_reason}</b>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Render Content
  render() {
    const { authUser, attestationData } = this.props;
    const { loading, proposal, expandTimeline } = this.state;

    if (!authUser || !authUser.id || loading) return null;
    if (!proposal || !proposal.id)
      return <div>{`We can't find any details`}</div>;

    // Access Check
    if (authUser.is_admin) {
      // Admin
    } else if (authUser.is_member) {
      // VA
      if (authUser.id == proposal.user_id) {
        // OP
      } else {
        // Not OP
        if (proposal.status != "approved" && proposal.status != "completed")
          return <Redirect to="/app" />;
      }
    } else {
      // Associate or Guest
      if (authUser.id == proposal.user_id) {
        // OP
      } else {
        // Not OP
        if (proposal.status != "approved" && proposal.status != "completed")
          return <Redirect to="/app" />;
        // if (proposal.votes && proposal.votes.length)
        //   return <Redirect to="/app" />;
      }
    }

    return (
      <div id="app-single-proposal-page">
        {this.renderHeader()}
        <div className="alert-with-va-rate">
          <div style={{ flex: 1 }}>
            <VoteAlertView
              proposal={proposal}
              onRefresh={() => this.getProposal()}
            />
          </div>
          {attestationData.related_to_proposal ? (
            <div className="app-simple-section topic-reads-chart">
              <CircularProgressbar
                value={attestationData.attestation_rate || 0}
                text={`${attestationData.attestation_rate?.toFixed() || 0}%`}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="d-flex flex-column flex-lg-row gap-box">
          <div className="proposal-detail-box">
            {this.renderDetail()}
            {this.renderComplianceCheck()}
            <>
              {proposal?.milestones?.map(
                (milestone, ind) =>
                  milestone?.milestone_review?.length > 0 &&
                  milestone?.milestone_review?.map((item, index) => (
                    <Card className="mt-3 mw-100" key={index}>
                      <CardHeader>
                        <div
                          className="app-simple-section__titleInner w-100"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <label className="pr-2">
                              {`Milestone log for ${proposal.id} - Milestone ${
                                ind + 1
                              } - Submission ${item.time_submit}`}
                            </label>
                            <Icon.Info size={16} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="py-3">
                          <label>
                            <b>Milestone Title:</b>
                          </label>
                          <p>{milestone.title}</p>
                        </div>
                        <div className="pb-3">
                          <label>
                            <b>Grant Protion:</b>
                          </label>
                          <p>
                            {Helper.formatPriceNumber(
                              milestone.grant || "",
                              "€"
                            )}
                          </p>
                        </div>
                        <div className="pb-3">
                          <label>
                            <b>Milestone Submission URL:</b>
                          </label>
                          <p>{item.milestone_submit_history?.url}</p>
                        </div>
                        {item?.milestone_check_list && (
                          <>
                            <label>
                              <b>Applicant checklist:</b>
                            </label>
                            <div className="">
                              <Checkbox
                                value={true}
                                text={`All attestations accepted on ${moment(
                                  item?.milestone_check_list?.created_at
                                ).format("M/D/YYYY")}`}
                                readOnly
                              />
                              <h6 className="mt-5">
                                Expert Dao (CR Dao) checklist:
                              </h6>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.crdao_acknowledged_project
                                  }
                                  text={`Expert Dao (CR Dao) has acknowledged the project Definition of Done? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_acknowledged_project_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.crdao_accepted_pm
                                  }
                                  text={`Expert Dao (CR Dao) has accepted the Program Management T&C? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_accepted_pm_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.crdao_acknowledged_receipt
                                  }
                                  text={`Expert Dao (CR Dao) has acknowledged receipt of the corpus of work? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_acknowledged_receipt_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <label className="padding-notes">
                                  Program management has valid response from
                                  Expert Dao?
                                  <b className="pr-2">
                                    {
                                      item?.milestone_check_list
                                        ?.crdao_valid_respone
                                    }
                                  </b>
                                  {moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}
                                </label>
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_valid_respone_note
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.crdao_submitted_review
                                  }
                                  text={`Expert Dao (CR Dao) has submitted a review of the corpus of work? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_submitted_review_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.crdao_submitted_subs
                                  }
                                  text={`Expert Dao (CR Dao) has acknowledged the project Definition of Done? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.crdao_submitted_subs_notes
                                  }
                                </p>
                              </div>
                              <h6 className="mt-5">
                                Program Management checklist:
                              </h6>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.pm_submitted_evidence
                                  }
                                  text={`Expert Dao (CR Dao) Program Management has submitted the Evidence of Work location? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.pm_submitted_evidence_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.pm_submitted_admin
                                  }
                                  text={`Expert Dao (CR Dao) Program Management has submitted Administrator notes? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.pm_submitted_admin_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.pm_verified_crdao
                                  }
                                  text={`Program Management has verified corpus existence? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.pm_verified_corprus_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.pm_verified_crdao
                                  }
                                  text={`Program Management has verified Expert Dao (CR Dao)'s review exists? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.pm_verified_crdao_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <CheckboxX
                                  value={
                                    +item?.milestone_check_list
                                      ?.pm_verified_subs
                                  }
                                  text={`Program Management has verified Expert Dao (CR Dao) substantiation (voting record) existence? ${moment(
                                    item?.milestone_check_list?.created_at
                                  ).format("M/D/YYYY")}`}
                                  readOnly
                                />
                                <p className="padding-notes">
                                  Notes:{" "}
                                  {
                                    item?.milestone_check_list
                                      ?.pm_verified_subs_notes
                                  }
                                </p>
                              </div>
                              <div className="my-3">
                                <p className="padding-notes">
                                  Other general reviewer notes:
                                  <span className="pl-2">
                                    {item?.milestone_check_list?.addition_note}
                                  </span>
                                </p>
                              </div>
                              <div className="my-3">
                                <p className="padding-notes">
                                  Program manager review submission timestamp:
                                  <span className="pl-2">
                                    {moment(item?.reviewed_at).format(
                                      "M/D/YYYY"
                                    )}
                                  </span>
                                </p>
                              </div>
                              <div className="my-3">
                                <p className="padding-notes">
                                  Program manager reviewer email:
                                  <span className="pl-2">
                                    {item?.user?.email}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </CardBody>
                    </Card>
                  ))
              )}
            </>
          </div>
          <div className="right-side">
            {authUser.is_admin ||
            authUser.is_member ||
            authUser.id === proposal.user_id ? (
              <div className="mb-3">
                <ProposalPosts proposal={proposal} />
              </div>
            ) : (
              ""
            )}
            {proposal.type === "grant" && (
              <div
                className={classNames(
                  "sidebar-timeline",
                  expandTimeline ? "expand" : ""
                )}
              >
                <div className="app-simple-section">
                  <div
                    className="d-flex"
                    // onClick={() =>
                    //   this.setState({ expandTimeline: !expandTimeline })
                    // }
                    style={{ cursor: "pointer" }}
                  >
                    <b className="title-timeline pl-2">Proposal Timeline</b>
                  </div>
                  <ul className="h-100 content-timeline">
                    {this.state.timelineList.map((x, index) => (
                      <li className="timeline-item" key={index}>
                        <div className="preview d-flex align-items-center">
                          <div className="pb-3 dot">
                            {index === 0 && <IconDot />}
                            {index !== 0 && !x.status && <IconEmptyDot />}
                            {index !== 0 && x.status && <IconCheckDot />}
                            <div className="line" />
                          </div>
                          <p className="date-timeline pb-3 pl-2">
                            {x.datetime}
                          </p>
                        </div>
                        <div className="full d-flex">
                          <p className="date-timeline">{x.datetime}</p>
                          <div className="pb-3 dot">
                            {index === 0 && <IconDot />}
                            {index !== 0 && !x.status && <IconEmptyDot />}
                            {index !== 0 && x.status && <IconCheckDot />}
                            <div className="line" />
                          </div>
                          <p>{x.title}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleProposal));
