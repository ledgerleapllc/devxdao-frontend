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
import { setActiveModal, setAttestationData } from "../../../redux/actions";
import { Flag } from "react-feather";
import TopicAttestationCard from "../shared/topic-attestation-card/TopicAttestationCard";
import { CircularProgressbar } from "react-circular-progressbar";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    attestationData: state.user.attestationData,
  };
};

class TopicDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topic: {},
      loading: true,
    };
  }

  componentDidMount() {
    const { match } = this.props;

    API.getTopic(match.params.topic)
      .then((res) => {
        if (res?.failed) {
          return;
        }

        this.setState({ topic: res.data });
        this.props.dispatch(setAttestationData(res.data.attestation));
      })
      .finally(() => this.setState({ loading: false }));
  }

  handleFlag = () => {
    this.props.dispatch(
      setActiveModal("topic-flag", {
        topic: this.state.topic,
      })
    );
  };

  handleProposal = () => {
    this.props.history.push(`/app/proposal/${this.state.topic.proposal.id}`);
  };

  // Render Header
  renderHeader() {
    const { topic } = this.state;
    if (!topic || !topic.id) return null;

    const { authUser, history, attestationData } = this.props;

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
          {attestationData.related_to_proposal ? (
            <button
              onClick={this.handleProposal}
              className="btn btn-primary btn-fluid less-small"
            >
              Proposal Detail
            </button>
          ) : (
            ""
          )}
          {(authUser.is_member ||
            authUser.is_admin ||
            authUser.is_super_admin) &&
            attestationData.related_to_proposal && (
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
    const { loading, topic } = this.state;
    const { attestationData } = this.props;

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
            {topic.proposal ? (
              <>
                <div className="app-simple-section p-3">
                  <ul className="ul-table">
                    <li>
                      <label>Proposal ID</label>
                      <span>{topic.proposal.id}</span>
                    </li>
                    <li>
                      <label>Proposal Status</label>
                      <span>{topic.proposal.status}</span>
                    </li>
                    <li>
                      <label>Comments</label>
                      <span>{topic.proposal.topic_posts_count}</span>
                    </li>
                  </ul>
                </div>
                <TopicAttestationCard topic={topic} />
                <div className="app-simple-section topic-reads-chart">
                  <CircularProgressbar
                    value={attestationData.attestation_rate || 0}
                    text={`${
                      attestationData.attestation_rate?.toFixed() || 0
                    }%`}
                  />
                </div>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicDetail));
