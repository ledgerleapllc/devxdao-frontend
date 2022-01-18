/* eslint-disable no-undef */
import EasyMDE from "easymde";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import API from "../../../../utils/API";
import MarkdownEditor from "../../../../utils/MarkdownEditor";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    editMode: state.admin.editMode,
  };
};

class EditPost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      postId: props.postId,
      postText: props.postText,
      errorText: null,
      loading: false,
    };

    this.editor = React.createRef(null);
    this.inputRef = React.createRef(null);
  }

  componentDidMount() {
    this.editor = MarkdownEditor(this.inputRef.current);

    this.editor.codemirror.on("change", () => {
      this.setState({ postText: this.editor.value() });
    });

    this.editor.codemirror.focus();
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { handleEdit } = this.props;
    const { postId, postText } = this.state;

    this.setState({ loading: true });

    API.updatePost(postId, {
      raw: postText,
    }).then((res) => {
      if (res?.response?.status === 422) {
        this.setState({
          loading: false,
          errorText: res.response.data.errors.post[0],
        });

        return;
      }

      this.setState({ loading: false });
      this.editor.value("");

      handleEdit &&
        handleEdit({
          cooked: res.post.cooked,
          updated_at: res.post.updated_at,
        });
    });
  };

  render() {
    const { loading, postText, errorText } = this.state;

    return (
      <form className="mt-3" onSubmit={this.handleSubmit}>
        <div className="fd-codemirror">
          <textarea
            ref={this.inputRef}
            defaultValue={postText}
            placeholder="What are your toughts?"
          ></textarea>
        </div>
        <div className="post-footer">
          <button className="post-btn" type="submit" disabled={loading}>
            {loading ? <BeatLoader size={8} color="#fff" /> : "Update"}
          </button>
          {errorText && <span className="error-text">{errorText}</span>}
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditPost));
