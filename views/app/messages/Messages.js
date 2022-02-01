import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import MessagesView from "../shared/messages/Messages";
import "./messages.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Messages extends Component {
  constructor(props) {
    super(props);

    this.folders = {
      "": "Inbox",
      sent: "Sent",
      new: "New",
      unread: "Unread",
      archive: "Archive",
    };

    this.state = {
      folder: "",
    };
  }

  componentDidMount() {
    const { authUser } = this.props;

    if (!authUser.is_member && !authUser.is_admin) {
      this.props.history.push("/app");
    }
  }

  handleFolder(folder) {
    this.setState({ folder });
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const { folder } = this.state;

    return (
      <div id="app-messages-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
            <div className="mb-3 mb-md-0">
              <button
                onClick={() => this.props.history.push("/app/messages/create")}
                className="btn btn-primary small mr-2"
              >
                New PM
              </button>
              <button
                onClick={() => this.props.history.push("/app/topics")}
                className="btn btn-primary small"
              >
                Topics
              </button>
            </div>
            <div className="message-folders">
              {Object.keys(this.folders).map((key, index) => (
                <button
                  key={index}
                  onClick={() => this.handleFolder(key)}
                  className={`message-folder ${folder === key ? "active" : ""}`}
                >
                  {this.folders[key]}
                </button>
              ))}
            </div>
          </div>
        </Fade>
        <MessagesView folder={folder} />
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Messages));
