import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { withRouter } from "react-router-dom";
import {
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { postHelp } from "../../utils/Thunk";

import "./help.scss";

const mapStateToProps = () => {
  return {};
};

class Help extends Component {
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
      this.props.dispatch(showAlert("Please input message content"));
      return;
    }

    this.props.dispatch(
      postHelp(
        text,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.setState({ text: "" });
            this.hideModal();
            this.props.dispatch(
              showAlert("Your request has been successfully sent", "success")
            );
          }
        }
      )
    );
  };

  render() {
    const { text } = this.state;
    return (
      <div id="help-modal">
        <div className="custom-modal-close" onClick={() => this.hideModal()}>
          <Icon.X />
          <label>Close Window</label>
        </div>

        <h3>{`This tool will send an email to the portal admin. Please allow up to 24 hours for a response.`}</h3>

        <textarea
          placeholder="Write Message"
          value={text}
          onChange={this.inputText}
        ></textarea>

        <div id="help-modal__buttons">
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

export default connect(mapStateToProps)(withRouter(Help));
