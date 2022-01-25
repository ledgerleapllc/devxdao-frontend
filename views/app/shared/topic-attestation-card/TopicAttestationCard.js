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
          ready_va_rate: res.data.ready_va_rate,
          ready_to_vote: res.data.ready_to_vote,
        })
      );

      this.props.dispatch(showAlert("Confirmed", "success"));
    });
  };

  render() {
    const { loading } = this.state;
    const { authUser, attestationData } = this.props;

    console.log(attestationData);

    if (!authUser.is_member || !attestationData.ready_to_vote) {
      return null;
    }

    return (
      <div className="app-simple-section topic-attestation-card mb-3">
        <div className="attestation-content">
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
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicAttestationCard));
