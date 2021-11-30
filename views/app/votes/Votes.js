import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import ActiveInformalVotesView from "../shared/active-informal-votes/ActiveInformalVotes";
import ActiveFormalVotesView from "../shared/active-formal-votes/ActiveFormalVotes";
import CompletedVotesView from "../shared/completed-votes/CompletedVotes";

import "./votes.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Votes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "active",
    };
  }

  render() {
    const { authUser } = this.props;
    const { tab } = this.state;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="app-votes-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <ul id="app-votes-pageHeader">
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
        <div className="box-votes">
          {tab == "active" ? (
            <Fragment>
              <ActiveInformalVotesView />
              <ActiveFormalVotesView />
            </Fragment>
          ) : (
            <Fragment>
              <CompletedVotesView />
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Votes));
