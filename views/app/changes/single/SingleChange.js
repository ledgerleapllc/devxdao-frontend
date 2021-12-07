import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { hideCanvas, showCanvas } from "../../../../redux/actions";
import { getProposalChangeById } from "../../../../utils/Thunk";
import SingleProposalDetailView from "../../shared/single-proposal-detail/SingleProposalDetail";
import SingleChangeDetailView from "../../shared/single-change-detail/SingleChangeDetail";
import CommentsView from "../../shared/comments/Comments";
import { PageHeaderComponent } from "../../../../components";
import { OP_WHAT_SECTION_ACTIONS } from "../../../../utils/Constant";

import "./single-change.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class SingleChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: {},
      proposalChange: {},
      proposalHistory: {},
      proposalId: 0,
      proposalChangeId: 0,
      loading: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const proposalId = params.proposalId;
    const proposalChangeId = params.proposalChangeId;

    this.setState({ proposalId, proposalChangeId }, () => {
      this.getData();
    });
  }

  getData = () => {
    const { proposalId, proposalChangeId } = this.state;
    this.props.dispatch(
      getProposalChangeById(
        proposalId,
        proposalChangeId,
        () => {
          this.setState({ loading: true });
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const proposal = res.proposal || {};
          const proposalChange = res.change || {};
          const proposalHistory = res.history || {};
          this.setState({
            loading: false,
            proposal,
            proposalChange,
            proposalHistory,
          });
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  renderTitle() {
    const { proposalChange } = this.state;
    if (proposalChange.what_section === "general_discussion") {
      return "General Discussion Thread";
    }

    let title = "Change to ";

    if (proposalChange.what_section) {
      const what_section = proposalChange.what_section;
      if (what_section == "short_description") title += "Proposal Description";
      else if (what_section == "total_grant") title += "Grant Total";
      else if (what_section == "previous_work") title += "OP's Previous Work";
      else if (what_section == "other_work") title += "Other Previous Work";
      else if (what_section == "remove_membership")
        title += "Remove Membership";
    }

    if (
      proposalChange.user &&
      proposalChange.user.profile &&
      proposalChange.user.profile.forum_name
    )
      return (
        <Fragment>
          {title} by <b>{proposalChange.user.profile.forum_name}</b>
        </Fragment>
      );

    return <Fragment>{title}</Fragment>;
  }

  renderFinalComment() {
    const { proposalChange } = this.state;
    const { status, updated_at } = proposalChange;

    if (status == "pending") return null;

    if (status == "approved") {
      return (
        <p className="font-size-14">
          <b className="color-success">THE OP APPROVED THIS CHANGE</b> -{" "}
          {moment(updated_at).fromNow()}
        </p>
      );
    } else if (status == "denied") {
      return (
        <p className="font-size-14">
          <b className="color-danger">THE OP DENIED THIS CHANGE</b> -{" "}
          {moment(updated_at).fromNow()}
        </p>
      );
    }

    return (
      <p className="font-size-14">
        <b className="color-primary">
          THE PERSON REQUESTING THIS CHANGE HAS CHOSEN TO WITHDRAW THEIR REQUEST
        </b>{" "}
        - {moment(updated_at).fromNow()}
      </p>
    );
  }

  render() {
    const { authUser } = this.props;
    const { loading, proposal, proposalChange, proposalHistory } = this.state;

    if (!authUser || !authUser.id || loading) return null;
    if (!proposal || !proposal.id || !proposalChange || !proposalChange.id)
      return <div>{`We can't find any details`}</div>;

    return (
      <div id="app-single-change-page">
        <PageHeaderComponent title={this.renderTitle()} />

        <SingleProposalDetailView proposal={proposal} />
        {proposalChange.what_section !== "general_discussion" && (
          <SingleChangeDetailView
            proposal={proposal}
            proposalChange={proposalChange}
            proposalHistory={proposalHistory}
            onRefresh={this.getData}
          />
        )}
        {!OP_WHAT_SECTION_ACTIONS.includes(proposalChange.what_section) && (
          <>
            <CommentsView proposal={proposal} proposalChange={proposalChange} />
            {this.renderFinalComment()}
          </>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleChange));
