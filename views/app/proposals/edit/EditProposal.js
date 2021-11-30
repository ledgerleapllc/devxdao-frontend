/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import "./edit-proposal.scss";
import ProposalFinalForm from "../../shared/proposal-final-form/ProposalFinalForm";
import { PageHeaderComponent } from "../../../../components";
import {
  getSingleProposalEdit,
  updateProposalShared,
  uploadFile,
} from "../../../../utils/Thunk";
import { hideCanvas, showAlert, showCanvas } from "../../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class EditProposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: null,
      proposalId: 0,
      loading: false,
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
          this.setState({ loading: false, proposalId, proposal });
        }
      )
    );
  }

  edit = (proposalValue, files, ids_to_remove) => {
    this.props.dispatch(
      updateProposalShared(
        { id: this.state.proposalId, type: proposalValue.type },
        proposalValue,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const { history } = this.props;
          if (res.success && res.proposal && res.proposal.id) {
            if (files?.length || ids_to_remove?.length) {
              const formData = new FormData();

              if (ids_to_remove?.length)
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
    const { proposal } = this.state;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-edit-proposal-page">
        <div style={{ marginTop: "50px" }}>
          <PageHeaderComponent
            title={"Edit Proposal: " + (proposal ? proposal?.title : "")}
            link="/app/proposals"
          />
        </div>

        <p>
          Please read{" "}
          <a
            href={process.env.NEXT_PUBLIC_FRONTEND_URL + "guide.pdf"}
            target="_blank"
            rel="noreferrer"
            className="dynamic-color"
          >
            <u>the guide</u>
          </a>{" "}
          first to understand this form.
        </p>

        {proposal && (
          <ProposalFinalForm proposal={proposal} onChange={this.edit} />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditProposal));
