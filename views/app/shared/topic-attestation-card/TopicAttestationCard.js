import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setAttestationData, showAlert } from "../../../../redux/actions";
import API from "../../../../utils/API";
import "./circular-progressbar.scss";
import "./topic-attestation-card.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    attestationData: state.user.attestationData,
  };
};

class TopicAttestationCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      topic: props.topic,
    };
  }

  componentDidUpdate(prevProps) {
    const { topic } = this.props;

    if (topic.id !== prevProps.topic.id) {
      this.setState({ topic });
    }
  }

  handleReadTopic = () => {
    const { topic } = this.state;
    if (!topic || !topic.id) return;

    this.setState({ loading: true });

    API.readTopic(topic.id).then((res) => {
      if (res?.failed) {
        this.props.dispatch(showAlert(res.message));
        return;
      }

      this.setState({ loading: false });

      this.props.dispatch(
        setAttestationData({
          attestation_rate: res.data.attestation_rate,
          is_attestated: true,
        })
      );

      this.props.dispatch(showAlert("Confirmed", "success"));
    });
  };

  attestationContent() {
    const { loading } = this.state;

    return (
      <>
        <span className="text">
          I attest and certify that I have read this grant and the entire body
          of comments in the thread. Based on my knowledge of the facts
          stipulated therein, I am ready to vote on this particular matter.
        </span>
        <button
          onClick={this.handleReadTopic}
          className="btn btn-primary btn-fulid less-small"
          disabled={loading}
        >
          Confirm
        </button>
      </>
    );
  }

  isAttestatedContent() {
    return <span className="text">Topic is attestated by you.</span>;
  }

  notInDiscussionContent() {
    return (
      <>
        <span className="text">
          I attest and certify that I have read this grant and the entire body
          of comments in the thread. Based on my knowledge of the facts
          stipulated therein, I am ready to vote on this particular matter.
        </span>
        <button
          className="btn btn-primary btn-fulid less-small"
          disabled={true}
        >
          Topic is not in discussion
        </button>
      </>
    );
  }

  render() {
    const { authUser, attestationData } = this.props;

    if (
      !authUser ||
      !authUser.is_member ||
      !attestationData.related_to_proposal
    ) {
      return null;
    }

    if (attestationData.proposal_in_discussion) {
    }

    return (
      <div className="app-simple-section topic-attestation-card mb-3">
        <div className="attestation-content">
          {attestationData.proposal_in_discussion ? (
            <>
              {attestationData.is_attestated
                ? this.isAttestatedContent()
                : this.attestationContent()}
            </>
          ) : (
            this.notInDiscussionContent()
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicAttestationCard));
