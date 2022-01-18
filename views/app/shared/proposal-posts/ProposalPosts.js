/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Card, CardHeader, CardBody } from "../../../../components/card";
import API from "../../../../utils/API";
import SinglePost from "../single-post/SinglePost";
import TopicPosts from "../topic-posts/TopicPosts";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    editMode: state.admin.editMode,
  };
};

class ProposalPosts extends Component {
  constructor(props) {
    super(props);

    const { proposal } = this.props;

    this.state = {
      expanded: false,
      topic: {},
      proposal,
      loading: true,
    };
  }

  componentDidMount() {
    API.getTopic(this.props.proposal.discourse_topic_id).then((res) => {
      res.data.post_stream.posts.shift();
      this.setState({ topic: res.data, loading: false });
    });
  }

  render() {
    const { expanded, topic, proposal, loading } = this.state;

    if (!proposal || !proposal.id) return null;

    return (
      <section id="app-proposal-posts-section">
        <div>
          <Card extraAction={this.toggle}>
            <CardHeader>
              <>
                {!expanded && (
                  <div
                    className="app-simple-section__titleInner w-100"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <label>Posts</label>
                      <Icon.Info size={16} className="ml-3" />
                    </div>
                  </div>
                )}
              </>
            </CardHeader>
            {!loading && topic.post_stream.posts.length > 0 && (
              <div className="discourse mt-3">
                <SinglePost
                  post={topic.post_stream.posts[0]}
                  topicId={proposal.discourse_topic_id}
                />
              </div>
            )}
            {!loading && (
              <CardBody>
                <TopicPosts topic={topic} />
              </CardBody>
            )}
          </Card>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ProposalPosts));
