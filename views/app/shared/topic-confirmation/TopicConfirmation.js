import React, { Component } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { showAlert } from "../../../../redux/actions";
import API from "../../../../utils/API";
import "./circular-progressbar.scss";
import "./topic-confirmation.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class TopicConfirmation extends Component {
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

      this.setState({
        topic: {
          ...topic,
          ready_to_vote: true,
          ready_va_rate: res.data.ready_va_rate,
        },
        loading: false,
      });

      this.props.dispatch(showAlert("Confirmed", "success"));
    });
  };

  render() {
    const { topic, loading } = this.state;
    const { authUser } = this.props;

    return (
      <>
        {authUser.is_member && topic.ready_to_vote === false && (
          <div className="app-simple-section topic-confirmation mb-3">
            <span className="text">
              I attest and certify that I have read this grant and the entire
              body of comments in the thread. Based on my knowledge of the facts
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
        )}
        <div className="app-simple-section topic-reads-chart">
          <CircularProgressbar
            value={topic.ready_va_rate || 0}
            text={`${topic.ready_va_rate?.toFixed() || 0}%`}
          />
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicConfirmation));
