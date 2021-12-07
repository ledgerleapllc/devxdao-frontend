import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./admin-team.scss";
import TeamTable from "./components/TeamTable";
import { Fade } from "react-reveal";
import { setActiveModal } from "../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class AdminTeam extends Component {
  constructor(props) {
    super(props);
  }

  openAddAdminDialog = () => {
    this.props.dispatch(setActiveModal("add-admin-box"));
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="team-page">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <label>Teams</label>
              <button
                className="my-1 btn btn-primary btn-download small ml-2"
                onClick={this.openAddAdminDialog}
              >
                + New Admin
              </button>
            </div>
            <TeamTable />
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AdminTeam));
