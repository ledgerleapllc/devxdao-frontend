import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import Dropzone from "react-dropzone";
import {
  removeActiveModal,
  setCustomModalData,
  showAlert,
  showCanvas,
  hideCanvas,
  setRefreshSingleUserPage,
  setAdminPendingUserTableStatus,
  setAdminUserTableStatus,
  setAdminActiveProposalTableStatus,
  setAdminPendingProposalTableStatus,
  setCompletedVotesTableStatus,
  setGrantTableStatus,
  setMasterPasswordStatus,
} from "../../redux/actions";
import { withRouter } from "react-router-dom";
import { FormInputComponent, FormSelectComponent } from "../../components";
import Helper from "../../utils/Helper";
import {
  changeUserType,
  changeUserAML,
  resetUserPassword,
  addReputation as addReputationMethod,
  subtractReputation as subtractReputationMethod,
  addEmailerAdmin,
  submitVote,
  allowAccessUser,
  denyAccessUser,
  withdrawProposal,
  restartVoting,
  activateGrant,
  checkMasterPassword,
} from "../../utils/Thunk";
import GrantLogsTable from "./grant-logs";
import "./custom-modal.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    customModalData: state.global.customModalData,
    settings: state.global.settings,
  };
};

class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      password_confirm: "",
      userType: "",
      addReputation: "",
      subReputation: "",
      emailAdmin: "",
      file: null,
      checked: false,
      masterPassword: "",
      address: "",
      zip: "",
      city: "",
    };
  }

  hideModal() {
    this.props.dispatch(setCustomModalData({}));
    this.props.dispatch(removeActiveModal());
  }

  inputField = (e, key) => {
    this.setState({ [key]: e.target.value });
  };

  inputIntField(e, key) {
    let value = e.target.value;
    // if (value && isNaN(value)) value = "";
    // if (value) value = parseInt(value).toString();
    // if (value && parseInt(value) < 1) value = "";
    this.setState({ [key]: value });
  }

  // Submit Change User Type
  submitChangeUserType(e, modalData) {
    e.preventDefault();
    let { userType } = this.state;

    const data = modalData.data;
    if (!data || !data.id) return;

    userType = userType.toLowerCase();

    if (!userType) {
      this.props.dispatch(showAlert("Please select user type"));
      return;
    }

    if (userType == "voting associate" && data.is_member) {
      this.props.dispatch(
        showAlert("This user's type is already Voting Associate")
      );
      return;
    }

    if (userType == "associate" && !data.is_member && data.is_participant) {
      this.props.dispatch(showAlert("This user's type is already Associate"));
      return;
    }

    const params = {
      userId: data.id,
      userType,
    };

    this.props.dispatch(
      changeUserType(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully changed the type of this user",
                "success"
              )
            );
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  }

  // Submit Change User Type
  submitChangeUserAML(e, modalData) {
    e.preventDefault();

    const params = {
      [modalData.field]: this.state[modalData.field],
    };

    this.props.dispatch(
      changeUserAML(
        modalData.data.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully changed information of this user",
                "success"
              )
            );
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  }

  // Submit Add Reputation
  submitAddReputation(e, modalData) {
    e.preventDefault();
    const { addReputation } = this.state;

    const data = modalData.data;
    if (!data || !data.id) return;

    if (!addReputation) {
      this.props.dispatch(showAlert("Please input valid amount to ADD"));
      return;
    }

    const params = {
      userId: data.id,
      reputation: +addReputation,
    };

    this.props.dispatch(
      addReputationMethod(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully added the reputation to this user",
                "success"
              )
            );
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  }

  // Submit Sub Reputation
  submitSubReputation(e, modalData) {
    e.preventDefault();
    const { subReputation } = this.state;

    const data = modalData.data;
    if (!data || !data.id || !data.profile) return;

    if (!subReputation) {
      this.props.dispatch(showAlert("Please input valid amount to SUBTRACT"));
      return;
    }

    if (+data.profile.rep < +subReputation) {
      this.props.dispatch(
        showAlert(
          "SUBTRACT amount cannot be higher than the current reputation value"
        )
      );
      return;
    }

    const params = {
      userId: data.id,
      reputation: +subReputation,
    };

    this.props.dispatch(
      subtractReputationMethod(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully subtracted the reputation from this user",
                "success"
              )
            );
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  }

  // Submit Add Emailer Admin
  submitEmailerAdmin(e) {
    e.preventDefault();
    const { emailAdmin } = this.state;

    if (!Helper.validateEmail(emailAdmin)) {
      this.props.dispatch(showAlert("Please input valid email address"));
      return;
    }

    const params = {
      email: emailAdmin,
    };

    this.props.dispatch(
      addEmailerAdmin(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully added new emailer admin",
                "success"
              )
            );
          }
        }
      )
    );
  }

  // Submit Reset Password
  submitReset(e, modalData) {
    e.preventDefault();
    const { password, password_confirm } = this.state;

    const data = modalData.data;
    if (!data || !data.id) return;

    if (!password || !password_confirm) {
      this.props.dispatch(showAlert("Please input password"));
      return;
    }

    if (password != password_confirm) {
      this.props.dispatch(showAlert("Password does not match"));
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(
        showAlert(
          `Please use a password with at least 8 characters including at least one number, one letter and one symbol`
        )
      );
      return;
    }

    const params = {
      userId: data.id,
      password,
    };

    this.props.dispatch(
      resetUserPassword(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(
              showAlert(
                "You've successfully reset the password of this user",
                "success"
              )
            );
            this.props.dispatch(setRefreshSingleUserPage(true));
          }
        }
      )
    );
  }

  // Confirm Vote
  confirmVote(modalData) {
    const { data } = modalData;
    const { checked } = this.state;

    if (!checked) {
      this.props.dispatch(
        showAlert(
          `Please understand the above and have reviewed the informal vote before making my decision.`
        )
      );
      return;
    }

    const params = {
      proposalId: data.proposalId,
      voteId: data.voteId,
      type: data.type,
      value: data.value,
    };

    this.props.dispatch(
      submitVote(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert("You've successfully submitted your vote", "success")
            );
            this.hideModal();
          }
        }
      )
    );
  }

  // Deny Access
  clickDenyAccess(modalData) {
    const { data } = modalData;
    if (!data || !data.id) return;

    this.props.dispatch(
      denyAccessUser(
        data.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setAdminPendingUserTableStatus(true));
            this.props.dispatch(setAdminUserTableStatus(true));
          }
        }
      )
    );
  }

  // Allow Access
  clickAllowAccess(modalData) {
    const { data } = modalData;
    if (!data || !data.id) return;

    this.props.dispatch(
      allowAccessUser(
        data.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setAdminPendingUserTableStatus(true));
            this.props.dispatch(setAdminUserTableStatus(true));
          }
        }
      )
    );
  }

  // Confirm Withdraw
  clickConfirmWithdraw(modalData, redirect = null) {
    const { data } = modalData;
    if (!data || !data.id) return null;

    this.props.dispatch(
      withdrawProposal(
        data.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setAdminActiveProposalTableStatus(true));
            this.props.dispatch(setAdminPendingProposalTableStatus(true));
            if (redirect) this.props.history.push(redirect);
          }
        }
      )
    );
  }

  // Click Revote
  clickRevote(modalData) {
    const { data } = modalData;
    if (!data || !data.id) return null;

    this.props.dispatch(
      restartVoting(
        data.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setCompletedVotesTableStatus(true));
          }
        }
      )
    );
  }

  // Click Informal
  clickInformal = (e, link) => {
    const { history } = this.props;
    e.preventDefault();
    this.hideModal();
    history.push(link);
  };

  // Click Activate
  clickActivate(modalData) {
    const { data } = modalData;
    if (!data || !data.id) return null;

    const { file } = this.state;
    if (!file) {
      this.props.dispatch(showAlert("Please select the final doc"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    this.props.dispatch(
      activateGrant(
        data.id,
        formData,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.hideModal();
            this.props.dispatch(setGrantTableStatus(true));
          }
        }
      )
    );
  }

  // Check Master Password
  doCheckMasterPassword = async (e) => {
    const { masterPassword } = this.state;
    e.preventDefault();
    this.props.dispatch(
      checkMasterPassword(
        { password: masterPassword },
        () => {
          this.props.dispatch(showCanvas());
        },
        async (res) => {
          this.props.dispatch(hideCanvas());
          if (!res.success) {
            this.props.dispatch(showAlert("Input valid master password"));
            return;
          }
          this.hideModal();
          await this.props.dispatch(setMasterPasswordStatus(false));
          await this.props.dispatch(setMasterPasswordStatus(true));
        }
      )
    );
  };

  // Sub Reputation Content
  renderSubReputation(modalData) {
    const { subReputation } = this.state;
    const { data } = modalData;

    if (!data || !data.id) return null;

    return (
      <Fragment>
        <h2>{modalData.title}</h2>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitSubReputation(e, modalData)}
        >
          <div className="c-form-row">
            <label>
              <b>The user current reputation is: {data.profile.rep}</b>
            </label>
          </div>
          <div className="c-form-row">
            <FormInputComponent
              type="number"
              value={subReputation}
              onChange={(e) => this.inputIntField(e, "subReputation")}
              placeholder="Enter amount to SUBTRACT"
              required={true}
            />
          </div>
          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  // Add Reputation Content
  renderAddReputation(modalData) {
    const { addReputation } = this.state;
    const { data } = modalData;

    if (!data || !data.id) return null;

    return (
      <Fragment>
        <h2>{modalData.title}</h2>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitAddReputation(e, modalData)}
        >
          <div className="c-form-row">
            <label>
              <b>The user current reputation is: {data.profile.rep}</b>
            </label>
          </div>
          <div className="c-form-row">
            <FormInputComponent
              type="number"
              value={addReputation}
              onChange={(e) => this.inputIntField(e, "addReputation")}
              placeholder="Enter amount to ADD"
              required={true}
            />
          </div>
          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  // Change User Type Content
  renderChangeUserTypeContent(modalData) {
    const { userType } = this.state;
    return (
      <Fragment>
        <h3>{modalData.title}</h3>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitChangeUserType(e, modalData)}
        >
          <div className="c-form-row">
            <FormSelectComponent
              placeholder="Change user to"
              options={["Voting Associate", "Associate"]}
              value={userType}
              onChange={(e) => this.setState({ userType: e.target.value })}
            />
          </div>

          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  renderEditUserAML(modalData) {
    const placeholder = {
      address: "Address",
      zip: "Zip Code",
      city: "City",
    };

    return (
      <Fragment>
        <h3>{modalData.title}</h3>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitChangeUserAML(e, modalData)}
        >
          <div className="c-form-row">
            <FormInputComponent
              type="text"
              value={this.state[modalData.field]}
              onChange={(e) => this.inputField(e, modalData.field)}
              placeholder={placeholder[modalData.field]}
              required={true}
            />
          </div>

          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  // Render Add Emailer Admin
  renderAddEmailerAdmin(modalData) {
    const { emailAdmin } = this.state;
    return (
      <Fragment>
        <h2>{modalData.title}</h2>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitEmailerAdmin(e)}
        >
          <div className="c-form-row">
            <FormInputComponent
              type="email"
              value={emailAdmin}
              onChange={(e) => this.inputField(e, "emailAdmin")}
              placeholder="Enter email address"
              required={true}
            />
          </div>
          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Add
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  // Reset Password Content
  renderResetContent(modalData) {
    const { password, password_confirm } = this.state;
    return (
      <Fragment>
        <h2>{modalData.title}</h2>

        <form
          action=""
          method="POST"
          onSubmit={(e) => this.submitReset(e, modalData)}
        >
          <div className="c-form-row">
            <FormInputComponent
              type="password"
              value={password}
              onChange={(e) => this.inputField(e, "password")}
              placeholder="New Password"
              required={true}
            />
          </div>
          <div className="c-form-row">
            <FormInputComponent
              type="password"
              value={password_confirm}
              onChange={(e) => this.inputField(e, "password_confirm")}
              placeholder="Confirm New Password"
              required={true}
            />
          </div>
          <div id="custom-global-modal__buttons">
            <button type="submit" className="btn btn-success">
              Submit
            </button>
            <a className="btn btn-primary" onClick={() => this.hideModal()}>
              Cancel
            </a>
          </div>
        </form>
      </Fragment>
    );
  }

  // Render Vote Confirm
  renderVoteConfirm(modalData) {
    const { checked } = this.state;
    const { data } = modalData;
    const informalVote = data.informalVote || {};
    let link = "";

    if (informalVote && informalVote.proposal_id) {
      link = `/app/proposal/${informalVote.proposal_id}/informal-vote`;
      if (informalVote.content_type == "milestone")
        link = `/app/proposal/${informalVote.proposal_id}/milestone-vote/${informalVote.id}`;
    }

    return (
      <Fragment>
        <h2>{modalData.title}</h2>
        <p className="font-size-18 mb-1">{`You currently have ${data.rep} reputation points available.`}</p>
        <p className="font-size-18 mb-3">{`This action will stake ${data.value} of those points.`}</p>
        <p className="font-size-14 mb-4">{`Remember, if you lose this vote, you will forfeit these Reputation points. If you win this vote, you will keep these points and gain a pro-rata share of any points staked by Voting Associates who are on the losing side of this vote. Reputation points are valuable. Having more points earns more rewards, and if you run low on points you will have less to vote with.`}</p>
        {informalVote && informalVote.id && link ? (
          <p className="font-size-14 mb-4">
            WARNING - this proposal passed the informal vote{" "}
            {informalVote.for_value}/{informalVote.against_value}. If you do not
            vote FOR this proposal, you risk losing all REP you are staking to
            this vote. Please review the informal vote results.{" "}
            <b
              style={{ cursor: "pointer" }}
              onClick={(e) => this.clickInformal(e, link)}
            >
              <u>View informal results</u>
            </b>
            .
          </p>
        ) : null}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <input
            style={{ marginTop: "2px", marginRight: "10px" }}
            id="informal-check"
            type="checkbox"
            required
            checked={checked}
            onChange={(e) => this.setState({ checked: e.target.checked })}
          />
          <label
            className="font-size-14"
            htmlFor="informal-check"
          >{`I understand the above and have reviewed the informal vote before making my decision.`}</label>
        </div>
        <div id="custom-global-modal__buttons">
          <a
            className="btn btn-success"
            onClick={() => this.confirmVote(modalData)}
          >
            Confirm
          </a>
          <a className="btn btn-primary" onClick={() => this.hideModal()}>
            Cancel
          </a>
        </div>
      </Fragment>
    );
  }

  // Remove File
  removeFile = () => {
    this.setState({ file: null });
  };

  // Render Selected File
  renderFile() {
    const { file } = this.state;
    if (!file) return null;

    return (
      <div id="file-wrap">
        <p>{file.name}</p>
        <Icon.X onClick={this.removeFile} />
      </div>
    );
  }

  // Render Confirm  Withdraw
  renderConfirmWithdraw(modalData) {
    return (
      <Fragment>
        <h2 className="text-center">{modalData.title}</h2>
        <p className="text-center">{`Withdrawing a proposal is irreversible and will update the status to "withdrawn" preventing it from moving forward.`}</p>
        <div id="custom-global-modal__buttons">
          <a
            className="btn btn-success"
            onClick={() => this.clickConfirmWithdraw(modalData)}
          >
            Confirm Withdraw
          </a>
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Cancel
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Confirm  Withdraw In Discussion
  renderConfirmDiscussionWithdraw(modalData) {
    return (
      <Fragment>
        <h2 className="text-center">{modalData.title}</h2>
        <div
          id="custom-global-modal__buttons"
          className="custom-confirm-discussion-withdraw d-flex flex-column"
        >
          <a
            className="btn btn-success"
            onClick={() =>
              this.clickConfirmWithdraw(modalData, "/app/discussions")
            }
          >
            Yes, please delete my proposal
          </a>
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            No please leave my proposal active
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Vote
  renderRevote(modalData) {
    const { settings } = this.props;
    const { data } = modalData;

    let quorum_rate = 0;
    if (data.content_type == "grant") quorum_rate = settings.quorum_rate;
    else if (data.content_type == "simple")
      quorum_rate = settings.quorum_rate_simple;
    else quorum_rate = settings.quorum_rate_milestone;

    return (
      <Fragment>
        <h2 className="text-center">{modalData.title}</h2>
        <p className="text-">
          It will immediately be voted on again and needs at least{" "}
          <b>{quorum_rate}%</b> of the Voting Associates to vote.
        </p>
        <div id="custom-global-modal__buttons">
          <a
            className="btn btn-success"
            onClick={() => this.clickRevote(modalData)}
          >
            Start Again
          </a>
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Cancel
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Manage Access
  renderManageAccess(modalData) {
    return (
      <Fragment>
        <h3>{modalData.title}</h3>
        <div id="custom-global-modal__buttons">
          <a
            className="btn btn-success"
            onClick={() => this.clickAllowAccess(modalData)}
          >
            Allow Access
          </a>
          <a
            className="btn btn-danger"
            onClick={() => this.clickDenyAccess(modalData)}
          >
            Deny Access
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Activate Grant
  renderActivateGrant(modalData) {
    return (
      <Fragment>
        <label className="d-block mb-4">{modalData.title}</label>
        <label className="d-block">PDF Files Only</label>
        <Dropzone
          multiple={false}
          accept="application/pdf"
          onDrop={(files) => {
            this.setState({ file: files[0] });
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <section id="c-dropzone">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Icon.Upload color="#9B64E6" />
                <p className="color-primary">Add File</p>
              </div>
            </section>
          )}
        </Dropzone>
        {this.renderFile()}
        <div id="custom-global-modal__buttons">
          <a
            className="btn btn-success"
            onClick={() => this.clickActivate(modalData)}
          >
            Activate
          </a>
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Cancel
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Voting Access Alert 2
  renderVotingAccessAlert2(modalData) {
    return (
      <Fragment>
        <h2>{modalData.title}</h2>
        <p>{`You did not vote during the informal phase of this proposal.`}</p>
        <p className="mt-3">{`You must vote in the informal stage to be allowed to vote in the formal vote.`}</p>
        <div className="text-center mt-5">
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Close
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Voting Access Alert
  renderVotingAccessAlert(modalData) {
    return (
      <Fragment>
        <h2>{modalData.title}</h2>
        <p>{`Please submit and complete your first grant to become a voting associate.`}</p>
        <div className="text-center mt-5">
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Close
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Signatures
  renderSignatures(modalData) {
    const { data, hideGrantLogs } = modalData;
    return (
      <Fragment>
        <h2>{modalData.title}</h2>
        <ul>
          {data?.signture_grants?.map((item, index) => {
            const signedAt = moment(item.updated_at)
              .local()
              .format("M/D/YYYY h:mm A");
            return (
              <li key={`signature_${index}`} className="mb-4">
                <p>
                  Role: <b>{item.role}</b>
                  <br />
                  Name: <b>{item.name}</b>
                  <br />
                  Email: <b>{item.email}</b>
                  <br />
                  Status:{" "}
                  <b>
                    {item.signed ? `Signed at ${signedAt}` : "Not signed yet"}
                  </b>
                </p>
              </li>
            );
          })}
        </ul>
        {!hideGrantLogs && (
          <>
            <h2>Remind / Resend / API tracker table</h2>
            <GrantLogsTable grantLogs={data?.grant_logs} />
          </>
        )}
        {/* {data?.grant_logs.length === 0 && <p>No item</p>}
        <ul>
          {data?.grant_logs?.map((item, index) => {
            return (
              <li key={`log_${index}`} className="mb-4">
                <p>
                  {item.email} clicked <b>{item.type}</b> on{" "}
                  {moment(item.created_at).local().format("D/M/YYYY h:mm A")}
                </p>
              </li>
            );
          })}
        </ul> */}
      </Fragment>
    );
  }

  // Render Master Password
  renderMasterPassword(modalData) {
    const { masterPassword } = this.state;
    return (
      <>
        <h2>{modalData.title}</h2>
        <div className="c-form-row">
          <FormInputComponent
            type="password"
            value={masterPassword}
            onChange={(e) => this.inputField(e, "masterPassword")}
            placeholder="Input Master Password"
            required={true}
          />
        </div>
        <div className="text-center mt-5">
          <a className="btn btn-success" onClick={this.doCheckMasterPassword}>
            Submit
          </a>
        </div>
      </>
    );
  }

  // Render Confirm  Withdraw
  renderConfirmSubmitProposal(modalData) {
    return (
      <Fragment>
        <h2 className="text-center">{modalData.title}</h2>
        <p className="text-center">{`Warning, you cannot make changes to a grant once submitted. Please be sure you have an appropriate amount of detail in all sections for your grant. Please be advised that insufficient details in your grant application may result in automatic dismissal of your grant from DxD consideration`}</p>
        <div id="custom-global-modal__buttons">
          <a className="btn btn-danger" onClick={() => this.hideModal()}>
            Go back
          </a>
          <a
            className="btn btn-success"
            onClick={() => {
              this.hideModal();
              modalData.onConfirm();
            }}
          >
            Submit
          </a>
        </div>
      </Fragment>
    );
  }

  // Render Main Content
  renderContent() {
    const { customModalData } = this.props;

    if (
      customModalData["reset-password"] &&
      customModalData["reset-password"].render
    )
      return this.renderResetContent(customModalData["reset-password"]);
    else if (
      customModalData["change-user-type"] &&
      customModalData["change-user-type"].render
    )
      return this.renderChangeUserTypeContent(
        customModalData["change-user-type"]
      );
    else if (
      customModalData["change-user-aml"] &&
      customModalData["change-user-aml"].render
    )
      return this.renderEditUserAML(customModalData["change-user-aml"]);
    else if (
      customModalData["add-reputation"] &&
      customModalData["add-reputation"].render
    )
      return this.renderAddReputation(customModalData["add-reputation"]);
    else if (
      customModalData["sub-reputation"] &&
      customModalData["sub-reputation"].render
    )
      return this.renderSubReputation(customModalData["sub-reputation"]);
    else if (
      customModalData["add-emailer-admin"] &&
      customModalData["add-emailer-admin"].render
    )
      return this.renderAddEmailerAdmin(customModalData["add-emailer-admin"]);
    else if (
      customModalData["manage-access"] &&
      customModalData["manage-access"].render
    )
      return this.renderManageAccess(customModalData["manage-access"]);
    else if (
      customModalData["vote-confirm"] &&
      customModalData["vote-confirm"].render
    )
      return this.renderVoteConfirm(customModalData["vote-confirm"]);
    else if (
      customModalData["confirm-withdraw"] &&
      customModalData["confirm-withdraw"].render
    )
      return this.renderConfirmWithdraw(customModalData["confirm-withdraw"]);
    else if (
      customModalData["confirm-discussion-withdraw"] &&
      customModalData["confirm-discussion-withdraw"].render
    )
      return this.renderConfirmDiscussionWithdraw(
        customModalData["confirm-discussion-withdraw"]
      );
    else if (customModalData["revote"] && customModalData["revote"].render)
      return this.renderRevote(customModalData["revote"]);
    else if (
      customModalData["activate-grant"] &&
      customModalData["activate-grant"].render
    )
      return this.renderActivateGrant(customModalData["activate-grant"]);
    else if (
      customModalData["signatures"] &&
      customModalData["signatures"].render
    )
      return this.renderSignatures(customModalData["signatures"]);
    else if (
      customModalData["voting-access-alert"] &&
      customModalData["voting-access-alert"].render
    )
      return this.renderVotingAccessAlert(
        customModalData["voting-access-alert"]
      );
    else if (
      customModalData["voting-access-alert-2"] &&
      customModalData["voting-access-alert-2"].render
    )
      return this.renderVotingAccessAlert2(
        customModalData["voting-access-alert-2"]
      );
    else if (
      customModalData["master-password"] &&
      customModalData["master-password"].render
    )
      return this.renderMasterPassword(customModalData["master-password"]);
    else if (
      customModalData["confirm-submit-proposal"] &&
      customModalData["confirm-submit-proposal"].render
    )
      return this.renderConfirmSubmitProposal(
        customModalData["confirm-submit-proposal"]
      );

    return null;
  }

  render() {
    const { customModalData } = this.props;
    if (!customModalData) return null;

    return (
      <div id="custom-global-modal">
        <div className="custom-modal-close" onClick={() => this.hideModal()}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        {this.renderContent()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CustomModal));
