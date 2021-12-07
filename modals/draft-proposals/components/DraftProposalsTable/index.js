import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import "./draft-proposals.scss";
import { Link } from "react-router-dom";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import {
  deleteProposalDraft,
  getProposalDrafts,
} from "../../../../utils/Thunk";
import {
  hideCanvas,
  removeActiveModal,
  showAlert,
  showCanvas,
} from "../../../../redux/actions";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class DraftProposalsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      sort_key: "",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
    };

    this.$elem = null;
    this.timer = null;
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.startTracking();

    this.getData();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;

    // Start Tracking
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.startTracking();
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("draft-proposal-scroll-track");
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (!this.$elem) return;
    if (
      this.$elem.scrollTop + this.$elem.clientHeight >=
      this.$elem.scrollHeight
    )
      this.runNextPage();
  };

  runNextPage() {
    const { calling, loading, finished, page_id } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page_id: page_id + 1 }, () => {
      this.getData(false);
    });
  }

  getData(showLoading = true) {
    let {
      calling,
      loading,
      finished,
      sort_key,
      sort_direction,
      search,
      page_id,
      data,
    } = this.state;
    if (loading || calling || finished) return;

    const params = {
      sort_key,
      sort_direction,
      search,
      page_id,
      limit: 20,
    };

    this.props.dispatch(
      getProposalDrafts(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          const finished = res.finished || false;
          this.setState({
            loading: false,
            calling: false,
            finished,
            data: [...data, ...result],
          });
        }
      )
    );
  }

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  deleteDraft = (id) => {
    if (!confirm("Are you sure you want to delete this grant?")) return;
    this.props.dispatch(
      deleteProposalDraft(
        id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(
              showAlert("Delete Draft successfully", "success")
            );
            this.reloadTable();
          }
        }
      )
    );
  };

  continue = () => {
    this.props.dispatch(removeActiveModal());
  };

  renderResult() {
    const { data } = this.state;
    const items = [];

    if (!data || !data.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    data.forEach((item) => {
      items.push(
        <li key={`mile_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{item.title}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{moment(item.created_at).local().format("M/D/YYYY")}</p>
            </div>
            <div className="c-col-3 c-cols">
              <Link
                to={`/app/proposal/new?draft=${item.id}`}
                onClick={this.continue}
                className="btn btn-primary extra-small btn-fluid-small"
              >
                Continue
              </Link>
              <button
                onClick={() => this.deleteDraft(item.id)}
                className="ml-2 btn btn-primary-outline extra-small btn-fluid-small"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { loading } = this.state;
    return (
      <div className="draft-proposals-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Title</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Date saved</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Action</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="draft-proposal-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DraftProposalsTable);
