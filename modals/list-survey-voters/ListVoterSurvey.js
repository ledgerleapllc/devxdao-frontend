import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal, showCanvas, hideCanvas } from "../../redux/actions";
import { getSurveyEmailVoter } from "../../utils/Thunk";

import "./style.scss";

const mapStateToProps = () => {
  return {};
};

class ListSurveyVoters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
    };
  }

  componentDidMount() {
    const { surveyId, proposal_id, place_choice } = this.props.data;
    this.props.dispatch(
      getSurveyEmailVoter(
        surveyId,
        { proposal_id, place_choice },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.setState({ users: res.users });
          }
        }
      )
    );
  }

  hideModal = () => {
    this.props.dispatch(removeActiveModal());
  };

  // Render Content
  render() {
    return (
      <div id="list-survey-voters-modal">
        <p className="pb-4">{`List of voters`}</p>
        <ul>
          {this.state.users?.map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
        <div className="actions">
          <button className="btn btn-primary small" onClick={this.hideModal}>
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ListSurveyVoters));
