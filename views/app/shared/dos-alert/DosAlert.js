import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { getMyPaymentProposals } from "../../../../utils/Thunk";

import "./dos-alert.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    activeProposalTableStatus: state.admin.activeProposalTableStatus,
  };
};

class DosAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      proposals: [],
    };
  }

  componentDidMount() {
    this.getPaymentProposals();
  }

  componentDidUpdate(prevProps) {
    const { activeProposalTableStatus } = this.props;
    if (!prevProps.activeProposalTableStatus && activeProposalTableStatus) {
      this.getPaymentProposals();
    }
  }

  getPaymentProposals() {
    this.props.dispatch(
      getMyPaymentProposals(
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const proposals = res.proposals || [];
          this.setState({ proposals, loading: false });
        }
      )
    );
  }

  render() {
    const { authUser } = this.props;
    const { loading, proposals } = this.state;
    if (!authUser || !authUser.id) return null;
    if (loading || !proposals.length) return null;

    // Associate or Voting Associate
    return (
      <Fade distance={"20px"} right duration={200} delay={500}>
        <div id="app-dos-alert-box">
          <div>
            <label className="font-weight-700">
              You have a proposal approved to move ahead!
            </label>
            <p className="font-size-12">{`To launch this proposal to the community for discussion and voting, you must first pay a DOS Fee in either ETH, BTC, or stake reputation.`}</p>
          </div>
        </div>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DosAlert));
