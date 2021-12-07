import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../components";
import {
  createSponsorCode,
  getSponsorCodes,
  revokeSponsorCode,
} from "../../../utils/Thunk";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import { CopyToClipboard } from "react-copy-to-clipboard";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class SponsorCodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      codes: [],
      sort_key: "sponsor_codes.id",
      sort_direction: "desc",
      calling: false,
      copied: [],
    };
  }

  componentDidMount() {
    this.getCodes();
  }

  clickRevoke(item) {
    if (!confirm("Are you sure you are going to revoke this sponsor code?"))
      return;
    this.props.dispatch(
      revokeSponsorCode(
        item.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.getCodes();
        }
      )
    );
  }

  getCodes(showLoading = true) {
    let { calling, loading, sort_key, sort_direction } = this.state;
    if (loading || calling) return;

    const params = {
      sort_key,
      sort_direction,
    };

    this.props.dispatch(
      getSponsorCodes(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          this.setState({
            loading: false,
            calling: false,
            codes: res.codes || [],
          });
        }
      )
    );
  }

  copy(item) {
    const { copied } = this.state;
    if (!copied.includes(item.id)) copied.push(item.id);
    this.setState({ copied }, () => {
      setTimeout(() => {
        copied.splice(copied.indexOf(item.id), 1);
        this.setState({ copied });
      }, 300);
    });
  }

  renderAction(item) {
    const { copied } = this.state;
    return (
      <div className="sponsor-codes-actions">
        <div>
          <CopyToClipboard text={item.code} onCopy={() => this.copy(item)}>
            <a
              style={{ marginRight: "0.5rem" }}
              className="btn btn-primary extra-small btn-fluid-small"
            >
              Copy
            </a>
          </CopyToClipboard>
          {copied.includes(item.id) ? (
            <label className="d-block font-size-11">Copied!</label>
          ) : null}
        </div>
        {!item.used ? (
          <a
            onClick={() => this.clickRevoke(item)}
            className="btn btn-danger extra-small btn-fluid-small"
          >
            Revoke
          </a>
        ) : null}
      </div>
    );
  }

  renderCodes() {
    const { codes } = this.state;
    const items = [];

    if (!codes || !codes.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    codes.forEach((item) => {
      items.push(
        <li key={`code_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14 font-weight-700">
                {item.code}
              </label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">
                {moment(item.created_at).local().format("M/D/YYYY")}{" "}
                {moment(item.created_at).local().format("h:mm A")}
              </label>
            </div>
            <div className="c-col-3 c-cols">
              <label className="font-size-14">
                {item.used ? "Used" : "Not Used"}
              </label>
            </div>
            <div className="c-col-4 c-cols">
              <label className="font-size-14">{item.proposal_id || ""}</label>
            </div>
            <div className="c-col-5 c-cols">{this.renderAction(item)}</div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  clickNew = (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you are going to generate a new code?")) return;
    this.props.dispatch(
      createSponsorCode(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.getCodes();
        }
      )
    );
  };

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Code</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Created At</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Status</label>
          </div>
          <div className="c-col-4 c-cols">
            <label className="font-size-14">Proposal #</label>
          </div>
          <div className="c-col-5 c-cols">
            <label className="font-size-14">Action</label>
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
      <div>
        <div className="mt-4">
          <a
            className="btn btn-primary small btn-fluid"
            onClick={this.clickNew}
          >
            Generate New Code
          </a>
        </div>
        <section
          id="app-sponsor-codes-section"
          className="app-infinite-box mt-5"
        >
          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}

              <div className="infinite-body" id="app-sponsor-codes-sectionBody">
                {loading ? (
                  <GlobalRelativeCanvasComponent />
                ) : (
                  this.renderCodes()
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SponsorCodes));
