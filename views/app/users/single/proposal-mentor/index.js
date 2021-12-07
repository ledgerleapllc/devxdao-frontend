import React, { Component } from "react";
import { connect } from "react-redux";
import { Fade } from "react-reveal";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { listProposalMentors } from "../../../../../utils/Thunk";

import "./style.scss";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ProposalMentor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
      sort_key: "",
      sort_direction: "desc",
      calling: false,
    };
  }

  componentDidMount() {
    this.getItems();
  }

  getItems(showLoading = true) {
    let { calling, loading, sort_key, sort_direction, items } = this.state;
    const { userId } = this.props;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      listProposalMentors(
        userId,
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          this.setState({
            loading: false,
            calling: false,
            items: [...items, ...result],
          });
        }
      )
    );
  }

  renderItems() {
    const { items: records } = this.state;
    const items = [];

    if (!records || !records.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    records.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14 font-weight-700">{item.id}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">{item.title}</label>
            </div>
            <div className="c-col-3 c-cols">{item.total_hours_mentor}</div>
            <div className="c-col-4 c-cols">
              {moment(item.created_at).local().format("M/D/YYYY")}
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Proposal #</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Title</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Mentor hours</label>
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Submitted Date</label>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return null;

    return (
      <Fade bottom duration={100} delay={100}>
        <section id="app-user-votes-section" className="app-infinite-box">
          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}

              <div className="infinite-body handler-box">
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderItems()
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(ProposalMentor);
