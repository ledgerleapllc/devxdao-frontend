import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { getMyPaymentProposals } from "../../../../utils/Thunk";
import { Link } from "react-router-dom";
import "./grant-alert.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    activeProposalTableStatus: state.admin.activeProposalTableStatus,
  };
};

class GrantAlert extends Component {
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
    // const { authUser } = this.props;
    // const { loading, proposals } = this.state;
    // if (!authUser || !authUser.id) return null;
    // if (loading || !proposals.length) return null;

    // Associate or Voting Associate
    return (
      <Fade distance={"20px"} right duration={200} delay={500}>
        <div id="app-grant-alert-box">
          <img src="/parts.png" alt="" />
          <div>
            <label className="font-weight-700">
              Way to go! You have a grant active. Need to submit a milestone for
              review and payment?
            </label>
            <p className="font-size-12">{`Go to your "My Grants" section in the left sidebar menu to submit milestones once work is complete.`}</p>
          </div>
          <div className="d-flex flex-column actions">
            <Link to="/app/grants" className="btn btn-primary mb-1">
              My Grants
            </Link>
          </div>
        </div>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(GrantAlert));
