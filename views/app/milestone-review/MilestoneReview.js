import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import {
  hideCanvas,
  setActiveModal,
  showAlert,
  showCanvas,
} from "../../../redux/actions";
import {
  approveReviewMilestone,
  getReviewMilestoneDetail,
} from "../../../utils/Thunk";
import "./milestone-review.scss";
import { PageHeaderComponent } from "../../../components";
import Dropzone from "react-dropzone";
import * as Icon from "react-feather";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class MilestoneReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      data: {},
      reviewDelivery: false,
      noteForm: {
        notes: "",
        files: [],
      },
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
      getReviewMilestoneDetail(
        mileId,
        () => {},
        (res) => {
          if (res.success) {
            const data = res.milestoneReview;
            const idx = data.milestones.findIndex((x) => +x.id === +mileId);
            data.milestoneIndex = idx + 1;
            this.setState({ data });
          }
        }
      )
    );
  }

  doApprove() {
    const { history } = this.props;
    const { noteForm } = this.state;
    const body = {
      notes: noteForm.notes,
      file: noteForm.files[0],
    };
    this.props.dispatch(
      approveReviewMilestone(
        this.state.id,
        body,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert(
                "You've successfully approved this milestone",
                "success"
              )
            );
            history.push("/app/milestones");
          }
        }
      )
    );
  }

  openRejectionDialog = () => {
    this.props.dispatch(
      setActiveModal("milestone-rejection", { milestoneId: this.state.id })
    );
  };

  setNotes = (val) => {
    const { noteForm } = this.state;
    noteForm.notes = val;
    this.setState({ noteForm });
  };

  delivery = () => {
    this.setState({ reviewDelivery: true });
  };

  appendFiles(extra) {
    let { noteForm } = this.state;
    noteForm.files = noteForm.files.concat(extra);

    this.setState({ noteForm });
  }

  removeFile(index) {
    let { noteForm } = this.state;
    noteForm.files.splice(index, 1);
    this.setState({ noteForm });
  }

  renderFiles() {
    const { files } = this.state.noteForm;
    if (!files || !files.length) return null;

    const items = [];
    files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <p>{file.name || file}</p>
          <Icon.X onClick={() => this.removeFile(index)} />
        </li>
      );
    });

    return (
      <div id="files-wrap">
        <label>
          <b>Files:</b>
        </label>
        <ul>{items}</ul>
      </div>
    );
  }

  render() {
    const { authUser } = this.props;
    const { data, noteForm } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="milestones-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent
            title={`Milestones review for ${data.proposal_id}-${data.milestoneIndex}`}
          />
          <section className="app-infinite-box pb-5 pr-4">
            <div className="pt-5 pl-5">
              <h4 className="pb-3">Summary</h4>
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-2">Times submitted:</td>
                      <td>{data.time_submit}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP Email:</td>
                      <td>{data.email}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal number:</td>
                      <td>{data.proposal_id}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal title:</td>
                      <td>{data.proposal_title}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal status:</td>
                      <td>{data.proposal_status}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Milestones in this proposal:</td>
                      <td>{data.milestones?.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4 className="pt-5 pb-3">User submission</h4>
              <div className="pb-5">
                <div className="c-form-row">
                  <label>Title of Milestone</label>
                  <p className="font-weight-700">{data.title}</p>
                </div>
                <div className="c-form-row">
                  <label>Show details of what will be delivered</label>
                  <p className="font-weight-700">{data.details}</p>
                </div>
                <div className="c-form-row">
                  <label>Show acceptance criteria</label>
                  <p className="font-weight-700">{data.criteria}</p>
                </div>
                <div className="c-form-row">
                  <label>Grant portion released</label>
                  <p className="font-weight-700">{data.grant}</p>
                </div>
                <div className="c-form-row">
                  <label>{`Please enter the URL of the repository or drive where the completed work has been made available.`}</label>
                  <p className="font-weight-700">{data.url}</p>
                </div>
                <div className="c-form-row">
                  <label>{`Please provide comments and notes regarding the completion of the work. If this is the second or further submission of this milestone, please explain what changes you have made since the last submission.`}</label>
                  <p className="font-weight-700 text-pre-wrap">
                    {data.comment}
                  </p>
                </div>
              </div>
              {this.state.reviewDelivery && (
                <div className="pb-5">
                  <p className="mb-2">
                    Reviewer - If you are ready to approve this milestone for
                    voting add your review notes here summarizing why this is
                    ready:
                  </p>
                  <textarea
                    className="mb-3"
                    placeholder={`Add notes here (mandatory)`}
                    rows="7"
                    value={this.state.noteForm.message}
                    onChange={(e) => this.setNotes(e.target.value)}
                  ></textarea>
                  <Dropzone
                    accept="application/pdf"
                    onDrop={(files) => this.appendFiles(files)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section id="c-dropzone">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <Icon.Upload color="#9B64E6" />
                          <p className="color-primary">Add Files</p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <div className="pt-3">{this.renderFiles()}</div>
                </div>
              )}
              <div className="text-right">
                {!this.state.reviewDelivery && (
                  <button
                    className="btn btn-primary"
                    onClick={() => this.delivery()}
                  >
                    Review delivery
                  </button>
                )}
                {this.state.reviewDelivery && (
                  <>
                    <button
                      className={`btn btn-white-outline mr-3`}
                      onClick={this.openRejectionDialog}
                    >
                      Deny and email message
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => this.doApprove()}
                      disabled={!noteForm.notes}
                    >
                      Approve and start vote
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(MilestoneReview));
