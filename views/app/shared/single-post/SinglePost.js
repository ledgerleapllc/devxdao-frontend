/* eslint-disable no-undef */
import moment from "moment";
import React, { Component } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Flag,
  Heart,
  Trash,
} from "react-feather";
import BeatLoader from "react-spinners/BeatLoader";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import API from "../../../../utils/API";
import WritePost from "../write-post/WritePost";
import EditPost from "../edit-post/EditPost";
import { Reply } from "@material-ui/icons";

const mapStateToProps = () => {
  return {};
};

class SinglePost extends Component {
  constructor(props) {
    super(props);

    const { post } = this.props;

    this.state = {
      post,
      displayReply: false,
      displayReplies: false,
      displayEdit: false,
      loading: false,
      deleteConfirmation: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.post !== this.props.post) {
      this.setState({ post: this.props.post });
    }
  }

  handleReact = () => {
    this.setState({ loading: true });

    API.reactPost(this.props.post.id)
      .then((res) => {
        if (res.success === false) {
          alert(res.message);
          return;
        }

        this.setState((prev) => ({
          post: {
            ...prev.post,
            ...res,
          },
        }));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleConfirmDestroy = () => {
    this.setState({ loading: true });

    API.destroyPost(this.props.post.id).then((res) => {
      if (res.success === false) {
        alert(res.message);
        return;
      }

      this.setState((prev) => ({
        loading: false,
        deleteConfirmation: false,
        post: {
          ...prev.post,
          cooked: res.cooked,
        },
      }));
    });
  };

  handleDestroy = () => {
    if (this.state.deleteConfirmation === true) {
      return this.handleConfirmDestroy();
    }

    this.setState({ deleteConfirmation: true });

    setTimeout(() => {
      this.setState({ deleteConfirmation: false });
    }, 3000);
  };

  handleDisplayReply = () => {
    this.setState((prev) => ({ displayReply: !prev.displayReply }));
  };

  handleReply = (data) => {
    this.handleDisplayReply();

    this.setState((prev) => ({
      post: {
        ...prev.post,
        replies: data,
        reply_count: data.length,
      },
    }));
  };

  handleEdit = () => {
    const { displayEdit, post } = this.state;

    if (displayEdit) {
      this.setState({ displayEdit: false });
      return;
    }

    this.setState({ loading: true });

    API.showPost(post.id)
      .then((res) => {
        this.setState({
          post: {
            ...post,
            raw: res.raw,
          },
          displayEdit: true,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  updateEdit = (post) => {
    this.handleEdit();

    this.setState({
      post: {
        ...this.state.post,
        ...post,
      },
    });
  };

  handleReplies = (postId) => {
    if (!this.state.displayReplies) {
      this.setState({ loading: true });

      API.getPostReplies(postId)
        .then((res) => {
          this.setState((prev) => ({
            post: {
              ...prev.post,
              replies: res.data,
            },
            displayReplies: true,
          }));
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    } else {
      this.setState((prev) => ({
        post: {
          ...prev.post,
          replies: [],
        },
        displayReplies: false,
      }));
    }
  };

  goToParentPost = (post) => {
    const parentPost = document.getElementById(`post-${post}`);

    if (!parentPost) {
      return;
    }

    const container = parentPost.querySelector(".post-container");

    parentPost.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const intersectionObserver = new IntersectionObserver((entries) => {
      let [entry] = entries;
      if (entry.isIntersecting) {
        setTimeout(() => {
          container.classList.add("post-highlight");

          setTimeout(() => {
            container.classList.remove("post-highlight");
          }, 500);

          intersectionObserver.unobserve(entry.target);
        }, 100);
      }
    });
    // start observing
    intersectionObserver.observe(container);
  };

  renderContent() {
    const {
      post,
      displayReply,
      displayReplies,
      displayEdit,
      loading,
      deleteConfirmation,
    } = this.state;

    const likes = post.actions_summary?.find((action) => action.id === 2) || {};

    return (
      <div id={`post-${post.post_number}`} className="post-wrapper">
        <div className={`post-container ${loading ? "post-loading" : ""}`}>
          <div className="post-loader">
            {loading && <BeatLoader color="#fff" />}
          </div>
          <div className="post-header">
            <div className="post-header-start">
              <div className="post-image">
                <img width="40" src="/user.png" alt="User avatar" />
              </div>
              <div className="post-meta">
                <div className="post-author">
                  <div className="post-writer">{post.username}</div>
                  {post.devxdao_user?.reputation > 0 && (
                    <div className="user-reputation">
                      {post.devxdao_user.reputation}
                    </div>
                  )}
                </div>
                <div className="post-date">
                  {moment(post.created_at).format("MM/DD/YYYY HH:mm")}
                </div>
              </div>
            </div>
            <div className="post-actions">
              <button
                onClick={this.handleReact}
                className={`post-action ${likes.acted ? "active" : ""}`}
                disabled={!likes.can_act && !likes.can_undo}
              >
                <Heart />
                {likes.count > 0 && (
                  <span className="post-action-value">{likes.count}</span>
                )}
              </button>
              <button
                onClick={this.handleDisplayReply}
                className={`post-action display-on-hover ${
                  displayReply ? "active" : ""
                }`}
              >
                <Reply />
                <span>Reply</span>
              </button>
              {post.can_edit && (
                <button
                  onClick={this.handleEdit}
                  className={`post-action display-on-hover ${
                    displayEdit ? "active" : ""
                  }`}
                >
                  <Edit />
                  <span>Edit</span>
                </button>
              )}
              {post.can_delete && (
                <button
                  onClick={this.handleDestroy}
                  className={`post-action display-on-hover ${
                    deleteConfirmation ? "action-confirm" : ""
                  }`}
                >
                  <Trash />
                  <span>{deleteConfirmation ? "Confirm" : "Delete"}</span>
                </button>
              )}
              {post.reply_to_post_number && (
                <button
                  onClick={() => this.goToParentPost(post.reply_to_post_number)}
                  className="post-action ml-auto"
                >
                  <Reply />
                  <span>{post.reply_to_user.username}</span>
                </button>
              )}
            </div>
          </div>
          {displayEdit ? (
            <EditPost
              postId={post.id}
              postText={post.raw}
              handleEdit={this.updateEdit}
            />
          ) : (
            <div className={`post-content ${post.flag ? "flag-content" : ""}`}>
              {post.flag && (
                <div className="flag-wrapper">
                  <Flag />
                  <span>as flag</span>
                </div>
              )}
              <div
                className="post-text"
                dangerouslySetInnerHTML={{ __html: post.cooked }}
              />
              {post.created_at !== post.updated_at && (
                <div className="post-updated">
                  <span>edited on</span>
                  {moment(post.updated_at).format("MM/DD/YYYY HH:mm")}
                </div>
              )}
            </div>
          )}
          {post.reply_count > 0 && (
            <div className="mt-2">
              <button
                onClick={() => this.handleReplies(post.id)}
                className="post-action"
              >
                {displayReplies ? <ChevronUp /> : <ChevronDown />}
                <span>{`${post.reply_count} ${
                  post.reply_count === 1 ? "Reply" : "Replies"
                }`}</span>
              </button>
            </div>
          )}
        </div>
        {displayReply && (
          <WritePost
            topicId={post.topic_id}
            parent={post.post_number}
            promise={() => API.getPostReplies(post.id)}
            callback={this.handleReply}
          />
        )}
        {displayReplies && post.replies.length > 0 && (
          <div className="post-replies">
            {post.replies.map((reply) => (
              <SinglePost key={reply.id} post={reply} />
            ))}
          </div>
        )}
      </div>
    );
  }

  render() {
    return this.renderContent();
  }
}

export default connect(mapStateToProps)(withRouter(SinglePost));
