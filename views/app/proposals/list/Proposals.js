import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import DosAlertView from "../../shared/dos-alert/DosAlert";
import GrantAlertView from "../../shared/grant-alert/GrantAlert";
import ProposalTracking from "../../shared/proposal-tracking/ProposalTracking";
import ActiveView from "./active/Active";
import CompletedView from "./completed/Completed";

import "./proposals.scss";
import {
  hideCanvas,
  setActiveModal,
  showCanvas,
} from "../../../../redux/actions";
import { getProposalDrafts } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Proposals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "active",
    };
  }

  createGrantProposal = () => {
    // const { authUser } = this.props;
    // if (authUser?.shuftipro) {
    this.props.dispatch(
      getProposalDrafts(
        { limit: 1 },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.proposals?.length) {
            this.openDraftProposal();
          } else {
            this.gotoNewGrant();
          }
        }
      )
    );
    // } else {
    //   this.props.dispatch(setActiveModal("kyc-grant"));
    // }
  };

  gotoNewGrant = () => {
    const { history } = this.props;
    history.push("/app/proposal/new");
  };

  openDraftProposal = () => {
    this.props.dispatch(setActiveModal("draft-proposals"));
  };

  // Not used for now
  renderMembershipButton() {
    const { authUser } = this.props;
    // Admin or Voting Associate
    if (authUser && (authUser.is_member || authUser.is_admin)) return null;

    // Has already a membership proposal
    if (authUser && authUser.membership && authUser.membership.id) return null;

    return (
      <Link
        to="/app/proposal/upgrade-membership"
        className="btn btn-primary-outline btn-fluid btn-icon"
      >
        <Icon.Plus />
        New Proposal for Membership
      </Link>
    );
  }

  // Render Buttons
  renderButtons() {
    const { authUser } = this.props;
    if (!authUser.is_admin) {
      return (
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <div
            id="app-proposals-page__buttons"
            className="mb-5 align-items-start"
          >
            <div className="d-flex gap-5 align-items-center flex-column mr-2">
              <button
                className="btn btn-primary btn-fluid mx-0"
                onClick={() => this.createGrantProposal()}
              >
                <img src="/tabs/plus.png" alt="" />
                New Grant Proposal
              </button>
              <a
                className="mt-2 text-underline"
                style={{ color: "inherit", cursor: "pointer" }}
                onClick={() => this.openDraftProposal()}
              >
                Load a saved proposal
              </a>
            </div>
            {authUser.is_member ? (
              <Link
                to="/app/simple-proposal/new"
                className="btn btn-primary-outline btn-fluid mr-2"
              >
                <Icon.Plus />
                New Simple Proposal
              </Link>
            ) : null}
            {authUser.is_member ? (
              <Link
                to="/app/admin-grant-proposal/new"
                className="btn btn-primary-outline btn-fluid mr-2"
              >
                <Icon.Plus />
                Admin Grant Proposal
              </Link>
            ) : null}
            {/* {authUser.is_member && authUser.grant_proposal ? (
              <Link
                to="/app/advance-payment-request/new"
                className="btn btn-primary-outline btn-fluid"
              >
                <Icon.Plus />
                Advance payment request
              </Link>
            ) : null} */}
          </div>
        </Fade>
      );
    }
    return null;
  }

  // Render Content
  renderContent() {
    const { authUser } = this.props;
    const { tab } = this.state;

    if (tab == "completed") {
      // Completed Tab
      return <CompletedView />;
    } else {
      // Active Tab
      if (authUser.is_admin) return <ActiveView />;
      else {
        return (
          <Fragment>
            {authUser.grant_active && <GrantAlertView />}
            <DosAlertView />
            <ProposalTracking />
            <ActiveView />
          </Fragment>
        );
      }
    }
  }

  render() {
    const { authUser } = this.props;
    const { tab } = this.state;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin && !authUser.is_member && !authUser.is_participant)
      return null;

    return (
      <div id="app-proposals-page">
        {this.renderButtons()}

        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <ul id="app-proposals-pageHeader">
            <li
              className={tab == "active" ? "active" : ""}
              onClick={() => this.setState({ tab: "active" })}
            >
              Active
            </li>
            <li
              className={tab == "completed" ? "active" : ""}
              onClick={() => this.setState({ tab: "completed" })}
            >
              Completed
            </li>
          </ul>
        </Fade>

        {this.renderContent()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Proposals));
