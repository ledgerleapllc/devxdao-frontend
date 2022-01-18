import { Component } from "react";
import API from "../../../../utils/API";
import { offsetPostIds, isLastPage } from "../../../../utils/Discourse";
import SinglePost from "../single-post/SinglePost";
import WritePost from "../write-post/WritePost";
import "../../topics/discourse.scss";

class TopicPosts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topic: props.topic,
      page: 0,
      loadMoreLoading: false,
    };
  }

  handleLoadMore = () => {
    this.setState(
      (prev) => ({ page: prev.page + 1, loadMoreLoading: true }),
      () => {
        const { topic, page } = this.state;
        const postIds = offsetPostIds(topic.post_stream.stream, page);

        API.getPosts(topic.id, postIds).then((res) => {
          this.setState((prev) => ({
            topic: {
              ...prev.topic,
              post_stream: {
                ...prev.topic.post_stream,
                posts: [...prev.topic.post_stream.posts, ...res.data],
              },
            },
            loadMoreLoading: false,
          }));
        });
      }
    );
  };

  handlePost = (post) => {
    return new Promise((resolve) => {
      this.setState(
        (prev) => ({
          topic: {
            ...prev.topic,
            post_stream: {
              ...prev.topic.post_stream,
              posts: [post, ...prev.topic.post_stream.posts],
            },
          },
        }),
        () => resolve(post)
      );
    });
  };

  render() {
    const { topic, page, loadMoreLoading } = this.state;

    if (!topic) {
      return <div>Loading...</div>;
    }

    return (
      <div className="discourse">
        <div className="write-post">
          <WritePost topicId={topic.id} promise={this.handlePost} />
        </div>
        <div className="posts">
          {topic.post_stream.posts.map((post) => (
            <SinglePost key={post.id} post={post} />
          ))}
        </div>
        {(!isLastPage(topic.post_stream.stream, page) ||
          loadMoreLoading === true) && (
          <div className="w-100 mt-3">
            <button
              onClick={this.handleLoadMore}
              className="post-action load-more"
              disabled={loadMoreLoading}
            >
              <span>Load More</span>
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default TopicPosts;
