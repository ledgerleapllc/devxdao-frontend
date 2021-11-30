import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { showCanvas, hideCanvas } from "../../../redux/actions";
import {
  getPublicProposal,
  getPublicGlobalSettings,
} from "../../../utils/Thunk";
import SingleProposalDetailView from "../../app/shared/single-proposal-detail/SingleProposalDetail";
import ProposalChangesView from "../../app/shared/proposal-changes/ProposalChanges";
import VoteAlertView from "../../app/shared/vote-alert/VoteAlert";
import { PageHeaderComponent } from "../../../components";

import "./proposal-detail.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
  };
};

class PublicProposalDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: {},
      proposalId: 0,
      loading: false,
      isShowLogs: true,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const proposalId = params.proposalId;
    this.setState({ proposalId }, () => {
      this.getProposal();
    });
    this.props.dispatch(
      getPublicGlobalSettings(
        () => {},
        () => {}
      )
    );
  }

  // Get Proposal
  getProposal() {
    const { proposalId } = this.state;

    this.props.dispatch(
      getPublicProposal(
        proposalId,
        () => {
          this.setState({ loading: true });
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const proposal = res.proposal || {};
          this.setState({ loading: false, proposalId, proposal });
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  // Render Header
  renderHeader() {
    const { proposal } = this.state;

    const title = proposal.title;
    // Not Admin
    return <PageHeaderComponent title={title} />;
  }

  // Render Detail
  renderDetail() {
    const { proposal } = this.state;
    return (
      proposal &&
      Object.keys(proposal).length > 0 && (
        <SingleProposalDetailView
          isAutoExpand
          proposal={proposal}
          refreshLogs={this.handleRefreshLogs}
        />
      )
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

  // Render Change Content
  renderChangeContent() {
    const { isShowLogs, proposal } = this.state;

    return (
      isShowLogs &&
      proposal &&
      Object.keys(proposal).length > 0 && (
        <ProposalChangesView proposal={proposal} isPublic />
      )
    );
  }

  // Render Content
  render() {
    const { proposal } = this.state;

    return (
      <div id="app-public-proposal-page">
        {this.renderHeader()}
        <VoteAlertView
          proposal={proposal}
          onRefresh={() => this.getProposal()}
        />
        {this.renderDetail()}
        {this.renderChangeContent()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PublicProposalDetail));
