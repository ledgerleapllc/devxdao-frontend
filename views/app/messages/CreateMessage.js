import React, { Component } from "react";
import MarkdownEditor from "../../../utils/MarkdownEditor";
import { BeatLoader } from "react-spinners";
import ReactTags from "react-tag-autocomplete";
import BackButton from "../../../components/back-button/BackButton";
import API from "../../../utils/API";
import "../topics/create-topic.scss";
import "../topics/discourse.scss";
import "./autocomplete.scss";

class CreateMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      raw: "",
      recipients: [],
      suggestions: [],
      loading: false,
      errorText: null,
    };

    this.rawInputRef = React.createRef(null);
    this.editor = React.createRef(null);
    this.suggestionsInputRef = React.createRef(null);
  }

  componentDidMount() {
    this.editor = new MarkdownEditor(this.rawInputRef.current, {
      maxHeight: "300px",
    });

    this.editor.codemirror.on("change", () => {
      this.setState({ raw: this.editor.value() });
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { title, raw, recipients } = this.state;

    this.setState({ loading: true });

    API.createMessage({
      title,
      raw,
      recipients: recipients.map((recipient) => recipient.name),
    }).then((res) => {
      if (res?.failed) {
        this.setState({ errorText: res.message, loading: false });
        return;
      }

      this.props.history.push(`/app/topics/${res.data.topic_id}`);
    });
  };

  handleDelete = (index) => {
    const { recipients } = this.state;
    this.setState({ recipients: recipients.filter((_, i) => i !== index) });
  };

  handleAddition = (tag) => {
    const { recipients } = this.state;
    this.setState({ recipients: [...recipients, tag] });
  };

  handleSearch = (value) => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      API.searchDiscourseUsers(value).then((res) => {
        if (res?.failed) {
          this.setState({ errorText: res.message });
          return;
        }

        this.setState({
          suggestions: res.data.users.map((user) => ({
            name: user.username,
          })),
        });
      });
    }, 300);
  };

  render() {
    const {
      title,
      raw,
      suggestions,
      recipients,
      loading,
      errorText,
    } = this.state;

    return (
      <>
        <div className="d-flex align-items-center">
          <BackButton link="/app/topics" />
          <h1 className="h3 ml-3 mb-0">Create new message</h1>
        </div>
        <form onSubmit={this.handleSubmit} className="discourse mt-3">
          <div className="fd-form">
            <div>
              <input
                type="text"
                className="fd-input"
                placeholder="Topic Title"
                autoFocus
                value={title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
            </div>
            <div>
              <ReactTags
                ref={this.suggestionsInputRef}
                tags={recipients}
                suggestions={suggestions}
                onDelete={this.handleDelete}
                onAddition={this.handleAddition}
                onInput={this.handleSearch}
                placeholderText="Add recipients"
              />
            </div>
            <div className="fd-codemirror">
              <textarea
                ref={this.rawInputRef}
                defaultValue={raw}
                placeholder="What are your thoughts?"
              ></textarea>
            </div>
            <button className="post-btn" type="submit" disabled={loading}>
              {loading ? <BeatLoader size={8} color="#fff" /> : "Send"}
            </button>
            {errorText && <span className="error-text">{errorText}</span>}
          </div>
        </form>
      </>
    );
  }
}

export default CreateMessage;
