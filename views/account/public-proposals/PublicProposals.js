import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { SwitchButton } from "../../../components";
import "./proposals.scss";
import { withRouter } from "react-router-dom";
import PublicProposalTable from "./components/public-proposal-table";
import PublicMilestoneTable from "./components/milestones-table";

const mapStateToProps = () => {
  return {};
};

class PublicProposals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeShow: false,
    };
  }

  render() {
    const { typeShow } = this.state;

    return (
      <div id="public-proposals-page">
        <div className="mx-auto">
          <h3>Public Transparency Viewer Tool {typeShow}</h3>
          <SwitchButton
            labelLeft="Show grant"
            labelRight="Show milestones"
            value={typeShow}
            onChange={(e) => this.setState({ typeShow: e.target.checked })}
          />
        </div>
        {!typeShow && (
          <Fade>
            <section
              id="app-all-proposals-section"
              className="app-infinite-box"
            >
              <PublicProposalTable />
            </section>
          </Fade>
        )}
        {typeShow && (
          <Fade>
            <section
              id="app-all-proposals-section"
              className="app-infinite-box"
            >
              <PublicMilestoneTable />
            </section>
          </Fade>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PublicProposals));
