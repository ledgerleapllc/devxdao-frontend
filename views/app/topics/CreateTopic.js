import React, { Component } from "react";
import MarkdownEditor from "../../../utils/MarkdownEditor";
import "./create-topic.scss";
import "./discourse.scss";
import { BeatLoader } from "react-spinners";
import BackButton from "../../../components/back-button/BackButton";
import API from "../../../utils/API";

class CreateTopic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      raw: "",
      loading: false,
      errorText: null,
    };

    this.rawInputRef = React.createRef(null);
    this.editor = React.createRef(null);
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

    const { title, raw } = this.state;

    this.setState({ loading: true });

    API.createTopic({ title, raw }).then((res) => {
      if (res?.failed) {
        this.setState({ errorText: res.message, loading: false });
        return;
      }

      this.props.history.push(`/app/topics/${res.data.topic_id}`);
    });
  };

  render() {
    const { title, raw, loading, errorText } = this.state;

    return (
      <>
        <div className="d-flex align-items-center">
          <BackButton link="/app/topics" />
          <h1 className="h3 ml-3 mb-0">Create new topic</h1>
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
            <div className="fd-codemirror">
              <textarea
                ref={this.rawInputRef}
                defaultValue={raw}
                placeholder="What are your toughts?"
              ></textarea>
            </div>
            <button className="post-btn" type="submit" disabled={loading}>
              {loading ? <BeatLoader size={8} color="#fff" /> : "Reply"}
            </button>
            {errorText && <span className="error-text">{errorText}</span>}
          </div>
        </form>
      </>
    );
  }
}

export default CreateTopic;
