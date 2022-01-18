import React, { Component } from "react";
import "./create-topic.scss";
import "./discourse.scss";
import { BeatLoader } from "react-spinners";
import BackButton from "../../../components/back-button/BackButton";
import API from "../../../utils/API";
import { GlobalRelativeCanvasComponent } from "../../../components";

class EditTopic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      topic: {},
      topicLoading: true,
      submitLoading: false,
      errorText: null,
    };
  }

  componentDidMount() {
    const { match } = this.props;

    API.getTopic(match.params.topic).then((res) => {
      this.setState({
        topicLoading: false,
        topic: res.data,
        title: res.data.title,
      });
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { topic, title } = this.state;

    this.setState({ submitLoading: true });

    API.updateTopic(topic.id, { title }).then((res) => {
      if (res?.failed) {
        this.setState({ errorText: res.message, submitLoading: false });
        return;
      }

      this.props.history.push(`/app/topics/${topic.id}`);
    });
  };

  render() {
    const { topic, title, topicLoading, submitLoading, errorText } = this.state;

    if (topicLoading) return <GlobalRelativeCanvasComponent />;
    if (!topic || !topic.id) return <div>{`We can't find any details`}</div>;

    return (
      <>
        <div className="d-flex align-items-center">
          <BackButton link="/app/topics" />
          <h1 className="h3 ml-3 mb-0">Edit topic title</h1>
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
            <button className="post-btn" type="submit" disabled={submitLoading}>
              {submitLoading ? <BeatLoader size={8} color="#fff" /> : "Reply"}
            </button>
            {errorText && <span className="error-text">{errorText}</span>}
          </div>
        </form>
      </>
    );
  }
}

export default EditTopic;
