import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import "./grants.scss";
import MemberGrant from "./MemberGrant";
import AdminGrant from "./AdminGrant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Grants extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div id="grant-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <>
            {!authUser.is_admin && <MemberGrant />}
            {!!authUser.is_admin && <AdminGrant />}
          </>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Grants));
