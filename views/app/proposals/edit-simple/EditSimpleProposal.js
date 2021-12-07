import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import Dropzone from "react-dropzone";
import { Fade } from "react-reveal";
import { PageHeaderComponent } from "../../../../components";
import {
  getSingleProposalEdit,
  updateSimpleProposalShared,
  uploadFile,
} from "../../../../utils/Thunk";
import { hideCanvas, showAlert, showCanvas } from "../../../../redux/actions";

import "./edit-simple-proposal.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class EditSimpleProposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: {},
      proposalId: 0,
      loading: false,
      title: "",
      short_description: "",
      files: [],
      ids_to_remove: [],
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const proposalId = params.proposalId;
    this.props.dispatch(
      getSingleProposalEdit(
        proposalId,
        () => {
          this.setState({ loading: true });
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          const proposal = res.proposal || {};
          this.setState({ loading: false, proposalId, proposal }, () => {
            if (proposal && proposal.id) this.initValues(proposal);
          });
        }
      )
    );
  }

  initValues(proposal) {
    const title = proposal.title || "";
    const short_description = proposal.short_description || "";
    const files = proposal.files || [];

    this.setState({ title, short_description, files });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  appendFiles(extra) {
    let { files } = this.state;
    files = files.concat(extra);

    this.setState({ files });
  }

  removeFile(index) {
    let { files, ids_to_remove } = this.state;
    const file = files[index];

    if (file && file.id && !ids_to_remove.includes(file.id))
      ids_to_remove.push(file.id);

    files.splice(index, 1);
    this.setState({ files, ids_to_remove });
  }

  renderFiles() {
    const { files } = this.state;
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

  submit = (e) => {
    e.preventDefault();

    const {
      proposalId,
      title,
      short_description,
      files,
      ids_to_remove,
    } = this.state;

    // Validation
    if (!title.trim()) {
      this.props.dispatch(showAlert("Please input proposal title"));
      return;
    }

    if (!short_description.trim()) {
      this.props.dispatch(showAlert("Please input short description"));
      return;
    }

    // API Call
    const params = {
      title: title.trim(),
      short_description: short_description.trim(),
    };

    this.props.dispatch(
      updateSimpleProposalShared(
        proposalId,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const { history } = this.props;
          if (res.success && res.proposal && res.proposal.id) {
            if (files && files.length) {
              const formData = new FormData();

              if (ids_to_remove.length)
                formData.append("ids_to_remove", ids_to_remove.join(","));

              files.forEach((file) => {
                if (!file.id) {
                  // New Files
                  formData.append("files[]", file);
                  formData.append("names[]", file.name);
                }
              });

              formData.append("proposal", res.proposal.id);

              this.props.dispatch(
                uploadFile(
                  formData,
                  () => {},
                  (res) => {
                    if (res.success) {
                      history.push("/app/proposals");
                      this.props.dispatch(
                        showAlert(
                          `You have successfully re-submitted your proposal. We will review it and keep you posted.`,
                          "success"
                        )
                      );
                      this.props.dispatch(hideCanvas());
                    }
                  }
                )
              );
            } else {
              history.push("/app/proposals");
              this.props.dispatch(
                showAlert(
                  `You have successfully re-submitted your proposal. We will review it and keep you posted.`,
                  "success"
                )
              );
              this.props.dispatch(hideCanvas());
            }
          } else this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const { title, short_description, loading, proposal } = this.state;

    if (loading) return null;
    if (!proposal || !proposal.id)
      return <div>{`We can't find any details`}</div>;

    let submitDisabled = false;
    if (title && short_description && title.trim() && short_description.trim())
      submitDisabled = false;

    return (
      <div id="app-edit-simple-proposal-page">
        <div style={{ marginTop: "50px" }}>
          <PageHeaderComponent
            title={"Edit Simple Proposal: " + proposal.title}
            link="/app/proposals"
          />
        </div>

        <form method="POST" action="" onSubmit={this.submit}>
          <Fade distance={"20px"} bottom duration={300} delay={600}>
            <div className="c-form-row mt-5">
              <label>Title of Proposal (limit 10 words)</label>
              <input
                value={title}
                type="text"
                onChange={(e) => this.inputField(e, "title")}
                required
              />
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={300} delay={600}>
            <div className="c-form-row">
              <label>{`Describe the change you think should be passed. This can relate to governance, platform rules, or any proposal not related to a grant.`}</label>
              <textarea
                value={short_description}
                onChange={(e) => this.inputField(e, "short_description")}
                required
              ></textarea>
            </div>
          </Fade>

          <Fade distance={"20px"} bottom duration={300} delay={600}>
            <div className="c-form-row mt-5">
              <label>
                {`Drag and drop a file into this box to upload pitch deck, project architecture, charts, etc.`}
                <br />
                {`( Only PDF files will be accepted )`}
              </label>
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
              {this.renderFiles()}
            </div>
          </Fade>

          <div id="c-button-wrap">
            <button
              type="submit"
              disabled={submitDisabled}
              className="btn btn-primary large"
            >
              Submit Simple Proposal
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditSimpleProposal));
