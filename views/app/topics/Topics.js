import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import TopicsView from "../shared/topics/Topics";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Topics extends Component {
  componentDidMount() {
    const { authUser } = this.props;

    if (!authUser.is_member && !authUser.is_admin) {
      this.props.history.push("/app");
    }
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-topics-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <div className="mb-3">
            <button
              onClick={() => this.props.history.push("/app/topics/create")}
              className="btn btn-primary small mr-3"
            >
              New Topic
            </button>
            <button
              onClick={() => this.props.history.push("/app/messages")}
              className="btn btn-primary small"
            >
              Messages
            </button>
          </div>
        </Fade>
        <TopicsView />
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Topics));
