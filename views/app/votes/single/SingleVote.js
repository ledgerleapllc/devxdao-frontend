import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Redirect } from "react-router-dom";
import {
  GlobalRelativeCanvasComponent,
  PageHeaderComponent,
} from "../../../../components";
import { hideCanvas, showCanvas } from "../../../../redux/actions";
import { DECIMALS } from "../../../../utils/Constant";
import {
  downloadVoteResultCSV,
  getSingleProposal,
  getVAsNotVote,
  downloadVoteResultPDF,
} from "../../../../utils/Thunk";

import "./single-vote.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
  };
};

class SingleVote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: {},
      vote: {},
      proposalId: 0,
      loading: true,
      notVotes: [],
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const proposalId = params.proposalId;
    this.setState({ proposalId, loading: true }, () => {
      this.getProposal();
    });
  }

  fetchVAsNotVote(voteId) {
    this.props.dispatch(
      getVAsNotVote(
        voteId,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.setState({
            notVotes: res.data,
          });
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  getProposal() {
    const { proposalId } = this.state;

    this.props.dispatch(
      getSingleProposal(
        proposalId,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const proposal = res.proposal || {};
          // Formal Vote
          let vote = {};
          if (proposal && proposal.votes && proposal.votes.length > 1)
            vote = proposal.votes[1];
          this.setState({ loading: false, proposalId, proposal, vote });
          this.fetchVAsNotVote(vote.id);
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  renderResult(vote) {
    if (vote.result == "success") {
      return "Success";
    } else if (vote.result == "no-quorum") {
      return "No Quorum";
    } else if (vote.result === null) {
      return "-";
    } else {
      return "Fail";
    }
  }

  exportCSV(proposal, vote) {
    this.props.dispatch(
      downloadVoteResultCSV(
        proposal.id,
        vote.id,
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `votes-result-${vote.id}.csv`);
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  exportPDF(proposal, vote) {
    this.props.dispatch(
      downloadVoteResultPDF(
        proposal.id,
        vote.id,
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `votes-result-${vote.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  }

  renderHeader() {
    const { proposal, vote } = this.state;
    return (
      <div className="d-flex justify-content-between mb-2">
        <PageHeaderComponent title={proposal.title} />
        <div>
          <button
            className="btn btn-primary small mr-2"
            onClick={() => this.exportPDF(proposal, vote)}
          >
            Export Vote Detail PDF
          </button>
          <button
            className="btn btn-primary small"
            onClick={() => this.exportCSV(proposal, vote)}
          >
            Export Vote Detail CSV
          </button>
        </div>
      </div>
    );
  }

  renderSummary() {
    const { proposal, vote } = this.state;
    return (
      <div className="app-simple-section mb-3">
        <ul>
          <li>
            <label>Vote Type:</label>
            <b>Formal</b>
          </li>
          <li>
            <label>Quorum Rate:</label>
            <b>{this.renderQuorum()}</b>
          </li>
          <li>
            <label>Votes Obtained:</label>
            <b>
              {vote.totalVotes} / {proposal.totalMembers}
            </b>
          </li>
          <li>
            <label>Result:</label>
            <b>{this.renderResult(vote)}</b>
          </li>
          <li>
            <label>Stake for/against:</label>
            <b>
              {vote.for_value} / {vote.against_value}
            </b>
          </li>
        </ul>
      </div>
    );
  }

  renderQuorum() {
    const { vote } = this.state;
    const { settings } = this.props;

    let quorum_rate = "";
    if (vote.content_type == "grant") quorum_rate = settings.quorum_rate || "";
    else if (vote.content_type == "simple")
      quorum_rate = settings.quorum_rate_simple || "";
    else quorum_rate = settings.quorum_rate_milestone || "";

    if (quorum_rate) quorum_rate = quorum_rate + "%";
    return quorum_rate;
  }

  renderInfiniteHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Forum Name</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Stake For</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Stake Against</label>
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Time of Vote</label>
          </div>
        </div>
      </div>
    );
  }

  renderItems() {
    const { vote } = this.state;
    const results = vote.results || [];
    const renderItems = [];

    if (!results || !results.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    results.forEach((item) => {
      renderItems.push(
        <li key={`vote_result_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">{item.forum_name}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">
                {item.type == "for" ? item.value?.toFixed?.(DECIMALS) : ""}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">
                {item.type == "against" ? item.value?.toFixed?.(DECIMALS) : ""}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{renderItems}</ul>;
  }

  renderVAItems() {
    const { notVotes } = this.state;
    const results = notVotes || [];
    const renderItems = [];

    if (!results || !results.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    results.forEach((item) => {
      renderItems.push(
        <li key={`vote_result_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">
                {item?.profile?.forum_name}
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">{item?.profile?.telegram}</label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">{item.email}</label>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{renderItems}</ul>;
  }

  render() {
    const { authUser } = this.props;
    const { loading, proposal, vote } = this.state;

    if (!authUser || !authUser.id || loading) return null;
    if (!proposal || !proposal.id || !vote || !vote.id)
      return <Redirect to="/app" />;

    // Active Vote
    if (!authUser.is_admin) {
      if (vote.status != "completed" || !vote.result)
        return <Redirect to="/app" />;
    }

    // User Access Check
    if (
      !authUser.is_member &&
      !authUser.is_admin &&
      !authUser.is_participant &&
      authUser.id != proposal.user_id
    )
      return <Redirect to="/app" />;

    return (
      <div id="app-single-vote-page">
        {this.renderHeader()}
        {this.renderSummary()}

        <section
          id="app-single-vote-results-section"
          className="app-infinite-box mb-3"
        >
          <div className="app-infinite-search-wrap">
            <label>Vote Results</label>
          </div>
          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderInfiniteHeader()}
              <div
                className="infinite-body"
                id="app-single-vote-results-sectionBody"
              >
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderItems()
                )}
              </div>
            </div>
          </div>
        </section>
        {!!authUser.is_admin && (
          <section
            id="app-single-note-vote-section"
            className="app-infinite-box mb-3"
          >
            <div className="app-infinite-search-wrap">
              <label>VAs who have not voted yet</label>
            </div>
            <div className="infinite-content">
              <div className="infinite-contentInner">
                <div className="infinite-header">
                  <div className="infinite-headerInner">
                    <div className="c-col-1 c-cols">
                      <label className="font-size-14">VA Forum Name</label>
                    </div>
                    <div className="c-col-2 c-cols">
                      <label className="font-size-14">VA Telegram</label>
                    </div>
                    <div className="c-col-3 c-cols">
                      <label className="font-size-14">VA Email</label>
                    </div>
                  </div>
                </div>
                <div
                  className="infinite-body"
                  id="app-single-vote-results-sectionBody"
                >
                  {loading ? (
                    <GlobalRelativeCanvasComponent />
                  ) : (
                    this.renderVAItems()
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleVote));
