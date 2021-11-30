import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
// import "./milestones.scss";
import VATables from "./components/VATables";
import {
  downloadCSVMilestones,
  getAllOPMilestones,
  getAllProposalMilestones,
} from "../../../utils/Thunk";
import moment from "moment";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import "./style.scss";
const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class VADirectory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      total: {},
      ops: [],
      proposals: [],
    };
    this.timer = null;
    this.getOPs();
    this.getProposalFilter();
  }

  getOPs() {
    this.props.dispatch(
      getAllOPMilestones(
        {},
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ ops: res.emails });
          }
        }
      )
    );
  }

  getProposalFilter() {
    this.props.dispatch(
      getAllProposalMilestones(
        {},
        () => {},
        (res) => {
          if (res.success) {
            this.setState({ proposals: res.proposalIds.map((x) => `${x}`) });
          }
        }
      )
    );
  }

  downloadCSV = () => {
    this.props.dispatch(
      downloadCSVMilestones(
        this.state.params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          const url = window.URL.createObjectURL(new Blob([res]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "milestones.csv");
          document.body.appendChild(link);
          link.click();
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  handleParams = (key, value) => {
    const { params } = this.state;
    if (key === "notSubmitted") {
      if (value) {
        params[key] = 1;
      } else {
        delete params[key];
      }
    } else if (["hidePaid", "hideCompletedGrants"].includes(key)) {
      if (value) {
        params[key] = 1;
      } else {
        delete params[key];
      }
    } else if (["startDate", "endDate"].includes(key)) {
      if (value) {
        const temp = moment(value).local().format("YYYY-MM-DD");
        params[key] = temp;
      } else {
        delete params[key];
      }
    } else {
      if (value) {
        params[key] = value;
      } else {
        delete params[key];
      }
    }
    this.setState({ params: { ...params } });
  };

  // Handle Search
  handleSearch = (val) => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      this.handleParams("search", val);
    }, 500);
  };

  getTotal = (total) => {
    this.setState({ total });
  };

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
