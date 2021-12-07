/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import {
  hideCanvas,
  setActiveModal,
  setCustomModalData,
  showCanvas,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";
import { regeneratePDF } from "../../../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customModalData: state.global.customModalData,
  };
};

class FormalDone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forP: 0,
      againstP: 0,
    };
  }

  componentDidMount() {
    const { vote } = this.props;
    const for_value = parseInt(vote.for_value);
    const against_value = parseInt(vote.against_value);
    const total_value = for_value + against_value;

    let forP = 0;
    let againstP = 0;

    if (total_value) {
      forP = 100 * parseFloat(for_value / total_value);
      forP = parseInt(forP);
      againstP = 100 - forP;
    }

    this.setState({
      forP,
      againstP,
    });
  }

  componentDidUpdate(prevProps) {
    const { customModalData, onRefresh } = this.props;
    const { customModalData: customModalDataPrev } = prevProps;

    if (
      customModalDataPrev &&
      customModalDataPrev.revote &&
      (!customModalData || !customModalData.revote)
    ) {
      if (onRefresh) onRefresh();
    }
  }

  clickRevote = (e) => {
    const { vote } = this.props;
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        revote: {
          render: true,
          title: "You are restarting this vote",
          data: vote,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  renderAlert() {
    const { authUser, vote, proposal } = this.props;
    if (vote.result == "no-quorum" && vote.status == "completed") {
      if (authUser.is_admin || authUser.id == proposal.user_id) {
        // Admin or OP
        return (
          <div className="app-simple-section mb-3">
            <div style={{ padding: 0 }}>
              <label className="font-size-14">{`This vote did not reach quorum. Not enough Voting Associates voted. Another vote is needed.`}</label>
              <a
                className="btn btn-primary small mt-2"
                onClick={this.clickRevote}
              >
                Revote
              </a>
            </div>
          </div>
        );
      }
    }
  }

  generate = () => {
    const { vote } = this.props;
    this.props.dispatch(
      regeneratePDF(
        vote.proposal_id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            window
              .open(
                Helper.joinURL(
                  process.env.NEXT_PUBLIC_BACKEND_URL,
                  res.pdf_link_url
                ),
                "_blank"
              )
              .focus();
          }
        }
      )
    );
  };

  render() {
    const { vote, authUser } = this.props;
    const { forP, againstP } = this.state;
    const passed = vote?.result === "success" && vote?.status === "completed";

    let link = `/app/proposal/${vote.proposal_id}/formal-vote`;
    if (vote.content_type == "milestone")
      link = `/app/proposal/${vote.proposal_id}/milestone-vote/${vote.id}`;

    return (
      <div id="app-spd-formal-done-wrap">
        {this.renderAlert()}
        <div className="flex">
          <div className="app-simple-section">
            <label>
              Formal Vote Results:{" "}
              <Link
                className="color-info"
                to={link}
                style={{ fontSize: "14px" }}
              >
                <u>(view vote detail)</u>
              </Link>
            </label>
            <div className="vote-result-row">
              <span
                style={{ width: `${forP}%`, backgroundColor: "#33C333" }}
              ></span>
              <label>{forP}%</label>
            </div>
            <div className="vote-result-row">
              <span
                style={{ width: `${againstP}%`, backgroundColor: "#EA5454" }}
              ></span>
              <label>{againstP}%</label>
            </div>
          </div>
          {passed && !!authUser.is_admin && (
            <button className="ml-4 btn btn-primary" onClick={this.generate}>
              Generate PDF
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(FormalDone));
