import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import VATables from "./components/VATables";
import "./style.scss";
const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class VADirectory extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_member && !authUser.is_admin && !authUser.is_super_admin)
      return <Redirect to="/" />;

    return (
      <div className="va-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="flex flex-column app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>VA Directory</label>
            </div>
            <div className="content">
              <VATables />
            </div>
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(VADirectory));
