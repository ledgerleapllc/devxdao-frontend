import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { showAlert, showCanvas, hideCanvas } from "../../../../redux/actions";
import {
  getProposalChangeComments,
  submitProposalChangeComment,
} from "../../../../utils/Thunk";

import "./comments.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
      comments: [],
    };
  }

  componentDidMount() {
    this.getComments();
  }

  getComments() {
    const { proposal, proposalChange } = this.props;

    this.props.dispatch(
      getProposalChangeComments(
        proposal.id,
        proposalChange.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          const comments = res.comments || [];
          this.setState({ comments });
        }
      )
    );
  }

  submitComment = (e) => {
    e.preventDefault();

    const { proposalChange } = this.props;
    const { comment } = this.state;

    const params = {
      proposalChange: proposalChange.id,
      comment,
    };

    if (!comment) {
      this.props.dispatch(showAlert("Please input comment"));
      return;
    }

    this.props.dispatch(
      submitProposalChangeComment(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.setState({ comment: "" });
            this.getComments();
          }
        }
      )
    );
  };

  inputComment = (e) => {
    this.setState({ comment: e.target.value });
  };

  renderComments() {
    const { comments } = this.state;
    const items = [];

    if (comments && comments.length) {
      comments.forEach((comment, index) => {
        items.push(
          <li key={`comment_${index}`}>
            <label className="d-block font-size-14">
              By <b>{comment.forum_name}</b> -{" "}
              {moment(comment.created_at).fromNow()}
            </label>
            <p className="font-size-12">{comment.comment}</p>
          </li>
        );
      });
    }

    return items;
  }

  renderForm() {
    const { proposal, proposalChange, authUser } = this.props;
    const { comment } = this.state;

    if (!authUser.is_member && authUser.id != proposal.user_id) return null;

    if (proposal.status == "approved" && proposalChange.status == "pending") {
      return (
        <form method="POST" action="" onSubmit={this.submitComment}>
          <textarea value={comment} onChange={this.inputComment}></textarea>
          <div id="app-comments-btn-wrap">
            <button
              type="submit"
              className="btn btn-primary btn-fluid less-small"
            >
              Add Comment
            </button>
          </div>
        </form>
      );
    }

    return null;
  }

  render() {
    const { proposal, proposalChange, authUser } = this.props;
    if (
      !proposal ||
      !proposal.id ||
      !proposalChange ||
      !proposalChange.id ||
      !authUser ||
      !authUser.id
    )
      return null;

    return (
      <section id="app-comments-section">
        <div id="app-comments-title">
          <label>Comments</label>
          <Icon.Info size={16} />
        </div>
        <div id="app-comments-body">
          <ul>{this.renderComments()}</ul>
          {this.renderForm()}
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Comments));
