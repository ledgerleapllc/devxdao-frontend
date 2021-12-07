import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import {
  Checkbox,
  CheckboxX,
  PageHeaderComponent,
  SwitchButton,
} from "../../../components";
import { getMilestoneDetail, togglePaidMilestone } from "../../../utils/Thunk";
import ActivityLogs from "./components/ActivityLogs";
import { showAlert } from "../../../redux/actions";
import moment from "moment";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class MilestoneLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      data: {},
      isShow: true,
      currentMilestone: null,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const id = params.id;
    this.setState({ id });
    this.getDetail(params.id);
  }

  getDetail(mileId) {
    this.props.dispatch(
      getMilestoneDetail(
        mileId,
        () => {},
        (res) => {
          if (res.success) {
            const data = res.milestone;
            const idx = data.milestones.findIndex((x) => +x.id === +mileId);
            data.milestoneIndex = idx + 1;
            this.setState({
              data,
              currentMilestone: data.milestones[idx],
            });
          }
        }
      )
    );
  }

  togglePaid = (val) => {
    const { data } = this.state;
    data.paid = !data.paid;
    this.setState({ data: { ...data } });
    this.props.dispatch(
      togglePaidMilestone(
        this.state.id,
        val ? 1 : 0,
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ isShow: false });
            this.props.dispatch(
              showAlert(
                "You've successfully update paid status of this milestone",
                "success"
              )
            );
            setTimeout(() => {
              this.setState({ isShow: true });
            }, 100);
          }
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    const { data, currentMilestone, id, isShow } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="milestones-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent
            title={`Milestones log for ${data.proposal_id}-${data.milestoneIndex}`}
          />
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <h4>Summary</h4>
              <SwitchButton
                value={!!data.paid}
                onChange={(e) => this.togglePaid(e.target.checked)}
                labelRight="paid"
                labelLeft="unpaid"
              />
            </div>
            <div className="pl-5">
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-2">Milestone status:</td>
                      <td className="font-weight-bold">
                        {data.submitted_time ? "Submitted" : "Not submitted"}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2 pb-2">Paid?:</td>
                      <td className="font-weight-bold">
                        {data.paid ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP email:</td>
                      <td className="font-weight-bold">{data.email}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal number:</td>
                      <td className="font-weight-bold">{data.proposal_id}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal title:</td>
                      <td className="font-weight-bold">
                        {data.proposal_title}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal status:</td>
                      <td className="font-weight-bold">
                        {data.proposal_status}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Milestones in this proposal:</td>
                      <td className="font-weight-bold">
                        {data.milestones?.length}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Milestone title:</td>
                      <td className="font-weight-bold">
                        {currentMilestone?.title}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Acceptance criteria:</td>
                      <td className="font-weight-bold">
                        {currentMilestone?.criteria}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP milestone submission URL:</td>
                      <td className="font-weight-bold">
                        {currentMilestone?.url}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2 align-top">
                        OP milestone submission notes:
                      </td>
                      <td className="font-weight-bold">
                        <p className="text-pre-wrap">
                          {currentMilestone?.comment}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Grant portion:</td>
                      <td className="font-weight-bold">
                        {currentMilestone?.grant}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Code reviewer:</td>
                      <td className="font-weight-bold">
                        {data?.admin_reviewer_email}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Review date:</td>
                      <td className="font-weight-bold">
                        {moment(currentMilestone?.reviewed_at).format(
                          "M/D/YYYY"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2 align-top">Reviewer notes:</td>
                      <td className="font-weight-bold">
                        <p className="text-pre-wrap">
                          {currentMilestone?.notes}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Reviewer attachments:</td>
                      <td className="font-weight-bold">
                        <a
                          className="text-underline"
                          target="_blank"
                          href={data?.support_file_url}
                          rel="noreferrer"
                        >
                          {data?.support_file?.split("/").pop()}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-5 app-infinite-search-wrap">
              <h4>Activity log</h4>
            </div>
            <div className="pl-5">
              {!!id && !!isShow && <ActivityLogs id={id} />}
            </div>
            {data?.milestone_check_list && (
              <>
                <div className="pt-5 app-infinite-search-wrap">
                  <h4>Applicant checklist</h4>
                </div>
                <div className="pl-5">
                  <Checkbox
                    value={true}
                    text={`All attestations accepted on ${moment(
                      data?.milestone_check_list?.created_at
                    ).format("M/D/YYYY")}`}
                    readOnly
                  />
                  <h6 className="mt-5">CRdao checklist:</h6>
                  <div className="my-3">
                    <CheckboxX
                      value={
                        +data?.milestone_check_list?.crdao_acknowledged_project
                      }
                      text={`CRDAO has acknowledged the project Definition of Done? ${moment(
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
                      text={`CRDAO has accepted the Program Management T&C? ${moment(
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
                      text={`CRDAO has acknowledged receipt of the corprus of work? ${moment(
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
                    <CheckboxX
                      value={
                        +data?.milestone_check_list?.crdao_submitted_review
                      }
                      text={`CRDAO has submitted a review of the corprus of work? ${moment(
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
                      text={`CRDAO has acknowledged the project Definition of Done? ${moment(
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
                      text={`CRDAO Program Management has submitted the Evidence of Work location? ${moment(
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
                      text={`CRDAO Program Management has submitted Administrator notes? ${moment(
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
                      text={`Program Management has verified corprus existence? ${moment(
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
                      text={`Program Management has verified CRDAO's review exists? ${moment(
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
                      text={`Program Management has verified CRDAO substantiation (voting record) existence? ${moment(
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
                      <span className="pl-2">{data?.admin_reviewer_email}</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(MilestoneLog));
