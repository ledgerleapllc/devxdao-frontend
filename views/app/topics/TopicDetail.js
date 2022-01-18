import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  CardBody,
  CardHeader,
  Card,
  PageHeaderComponent,
  GlobalRelativeCanvasComponent,
} from "../../../components";
import TopicPosts from "../shared/topic-posts/TopicPosts";
import API from "../../../utils/API";
import { connect } from "react-redux";
import { setActiveModal, showAlert } from "../../../redux/actions";
import { Flag } from "react-feather";
import { CircularProgressbar } from "react-circular-progressbar";
import "./circular-progressbar.scss";

// #4c3865

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class TopicDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topic: {},
      loading: true,
      readTopicLoading: false,
    };
  }

  componentDidMount() {
    const { match } = this.props;

    API.getTopic(match.params.topic).then((res) => {
      this.setState({
        loading: false,
        topic: res.data,
      });
    });
  }

  handleFlag = () => {
    this.props.dispatch(
      setActiveModal("topic-flag", {
        topic: this.state.topic,
      })
    );
  };

  handleReadTopic = () => {
    const { topic } = this.state;
    if (!topic || !topic.id) return;

    this.setState({ readTopicLoading: true });

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
        readTopicLoading: false,
      });

      this.props.dispatch(showAlert("Confirmed", "success"));
    });
  };

  // Render Header
  renderHeader() {
    const { topic } = this.state;
    if (!topic || !topic.id) return null;

    const { authUser, history } = this.props;

    return (
      <PageHeaderComponent title={topic.title}>
        <div className="fd-page-actions ml-auto">
          {topic.details.can_edit && (
            <button
              onClick={() => history.push(`/app/topics/${topic.id}/edit`)}
              className="btn btn-primary btn-fluid less-small"
            >
              Edit Topic Title
            </button>
          )}
          {(authUser.is_member ||
            authUser.is_admin ||
            authUser.is_super_admin) && (
            <button
              onClick={this.handleFlag}
              className="btn btn-primary btn-fluid less-small"
            >
              Flag Topic
            </button>
          )}
          {topic.flags_count > 0 && (
            <div className="total-flag-count">
              <Flag />
              <span>{topic.flags_count}</span>
            </div>
          )}
        </div>
      </PageHeaderComponent>
    );
  }

  // Render Content
  render() {
    const { loading, readTopicLoading, topic } = this.state;
    const { authUser } = this.props;

    if (loading) return <GlobalRelativeCanvasComponent />;
    if (!topic || !topic.id) return <div>{`We can't find any details`}</div>;

    return (
      <section id="app-topic-detail-page" className="discourse">
        {this.renderHeader()}
        <div className="fd-topic-container">
          <div className="fd-topic-posts">
            <Card isAutoExpand={true}>
              <CardHeader>Posts</CardHeader>
              <CardBody>
                <TopicPosts topic={topic} />
              </CardBody>
            </Card>
          </div>
          <div className="fd-topic-reads">
            {authUser.is_member && topic.ready_to_vote === false && (
              <div className="app-simple-section topic-confirmation mb-3">
                <span className="text">
                  I attest and certify that I have read this grant and the
                  entire body of comments in the threat. Based on my knowledge
                  of the facts stipulated therein, I am ready to vote on this
                  particular matter.
                </span>
                <button
                  onClick={this.handleReadTopic}
                  className="btn btn-primary btn-fulid less-small"
                  disabled={readTopicLoading}
                >
                  Confirm
                </button>
              </div>
            )}
            <div className="app-simple-section topic-reads-chart">
              <CircularProgressbar
                value={topic.ready_va_rate}
                text={`${topic.ready_va_rate?.toFixed()}%`}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicDetail));
