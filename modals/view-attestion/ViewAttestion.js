import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { showCanvas, hideCanvas, removeActiveModal } from "../../redux/actions";
import {
  getFlagAttested,
  getTopicAttested,
  getTopicNotAttested,
} from "../../utils/Thunk";
import AttestTable from "./components/AttestTable";
import UnattestTable from "./components/UnattestTable";

import "./view-attestion.scss";

const mapStateToProps = () => {
  return {};
};

class ViewAttestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAttest: null,
      flagAttest: null,
      userNotAttest: null,
      params: {
        sort_key: "users.id",
        sort_direction: "desc",
        page_id: "1",
        limit: "999",
      },
    };
  }

  componentDidMount() {
    const { topicId } = this.props.data;
    this.props.dispatch(
      getTopicAttested(
        topicId,
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.setState({
              userAttest: res.users,
            });
          }
        }
      )
    );
    this.props.dispatch(
      getTopicNotAttested(
        topicId,
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.setState({
              userNotAttest: res.users,
            });
          }
        }
      )
    );
    this.props.dispatch(
      getFlagAttested(
        topicId,
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.setState({
              flagAttest: res.users,
            });
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
    const { userAttest, userNotAttest, flagAttest } = this.state;
    return (
      <>
        {!!userAttest && !!userNotAttest && (
          <div id="view-attestion-modal">
            <h3>These VAs have attested</h3>
            <AttestTable data={userAttest} />
            <h3>These VAs have not attested</h3>
            <UnattestTable data={userNotAttest} />
            <h3>These VAs clicked the FLAG button</h3>
            <UnattestTable data={flagAttest} />
            <button
              className="btn btn-primary-outline"
              onClick={this.hideModal}
            >
              Close
            </button>
          </div>
        )}
      </>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ViewAttestion));
