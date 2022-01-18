import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { withRouter } from "react-router-dom";
import { hideCanvas, removeActiveModal, showAlert } from "../../redux/actions";

import "./topic-flag.scss";
import API from "../../utils/API";

const mapStateToProps = () => {
  return {};
};

class TopicFlag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
    };
  }

  hideModal() {
    this.props.dispatch(removeActiveModal());
  }

  inputText = (e) => {
    this.setState({ text: e.target.value });
  };

  clickSubmit = (e) => {
    e.preventDefault();
    const { text } = this.state;
    if (!text || !text.trim()) {
      this.props.dispatch(showAlert("Please input reason"));
      return;
    }

    API.flagTopic(this.props.data.topic.id, {
      reason: text,
    }).then((res) => {
      if (res?.failed) {
        this.props.dispatch(showAlert(res.message));
        return;
      }

      this.props.dispatch(hideCanvas());
      this.hideModal();
      this.props.dispatch(
        showAlert("Your request has been successfully sent", "success")
      );
    });
  };

  render() {
    const { text } = this.state;
    const topic = this.props.data.topic;

    return (
      <div id="topic-flag-modal">
        <div className="custom-modal-close" onClick={() => this.hideModal()}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h3>Flag {topic.title}</h3>

        <textarea
          placeholder="Write Reason"
          value={text}
          onChange={this.inputText}
        ></textarea>

        <div id="topic-flag-modal__buttons">
          <a className="btn btn-success" onClick={this.clickSubmit}>
            Submit
          </a>
          <a className="btn btn-primary" onClick={() => this.hideModal()}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TopicFlag));
