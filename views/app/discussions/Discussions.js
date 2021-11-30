import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import DiscussionsView from "../shared/discussions/Discussions";

import "./discussions.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Discussions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "active",
    };
  }

  render() {
    const { tab } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-discussions-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <ul id="app-discussions-pageHeader">
            <li
              className={tab == "active" ? "active" : ""}
              onClick={() => this.setState({ tab: "active" })}
            >
              Active
            </li>
            <li
              className={tab == "completed" ? "active" : ""}
              onClick={() => this.setState({ tab: "completed" })}
            >
              Completed
            </li>
          </ul>
        </Fade>

        <DiscussionsView tab={tab} />
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Discussions));
