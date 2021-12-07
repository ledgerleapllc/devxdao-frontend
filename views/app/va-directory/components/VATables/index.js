import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { DECIMALS } from "../../../../../utils/Constant";
import { getVADirectory } from "../../../../../utils/Thunk";
import "./va-directory.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class VATables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      sort_key: "id",
      sort_direction: "desc",
      search: "",
      page_id: 1,
      calling: false,
      finished: false,
      total_members: 0,
    };

    this.$elem = null;
    this.timer = null;
  }

  handleSearch = (e) => {
    this.setState({ search: e.target.value }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.reloadTable();
      }, 500);
    });
  };

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

  renderTriangle(key) {
    const { sort_key, sort_direction } = this.state;
    if (sort_key != key) return <span className="inactive">&#9650;</span>;
    else {
      if (sort_direction == "asc") return <span>&#9650;</span>;
      else return <span>&#9660;</span>;
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("va-scroll-track");
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
      getVADirectory(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.users || [];
          const finished = res.finished || false;
          this.setState({
            total_members: res?.total_members,
            loading: false,
            calling: false,
            finished,
            data: [...data, ...result],
          });
        }
      )
    );
  }

  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
    });
  }

  clickHeader(key) {
    let { sort_key, sort_direction } = this.state;
    if (sort_key == key)
      sort_direction = sort_direction == "asc" ? "desc" : "asc";
    else {
      sort_key = key;
      sort_direction = "desc";
    }

    this.setState({ sort_key, sort_direction }, () => {
      this.reloadTable();
    });
  }

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
              <p>
                {item.first_name} {item.last_name}
              </p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.total_vote_percent?.toFixed?.(2)}%</p>
            </div>
            <div className="c-col-4 c-cols">
              <p>{item.last_month_vote_percent?.toFixed?.(2)}%</p>
            </div>
            <div className="c-col-5 c-cols">
              <p>{item.this_month_vote_percent?.toFixed?.(2)}%</p>
            </div>
            <div className="c-col-6 c-cols">
              <p>{item.total_rep?.toFixed?.(DECIMALS)}</p>
            </div>
            <div className="c-col-7 c-cols">
              <p>{moment(item.member_at).local().format("M/D/YYYY")}</p>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { loading, total_members, search } = this.state;
    return (
      <div className="va-table infinite-content">
        <div className="d-flex justify-content-between mb-3 mr-2 align-items-center">
          <p className="pl-3 pb-3">Total voting associates: {total_members}</p>
          <input
            type="text"
            value={search}
            onChange={this.handleSearch}
            placeholder="Search..."
          />
        </div>
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div
                className="c-col-1 c-cols"
                onClick={() => this.clickHeader("first_name")}
              >
                <label className="font-size-14">Name</label>
                {this.renderTriangle("first_name")}
              </div>
              <div
                className="c-col-2 c-cols"
                onClick={() => this.clickHeader("email")}
              >
                <label className="font-size-14">Email</label>
                {this.renderTriangle("email")}
              </div>
              <div
                className="c-col-3 c-cols"
                onClick={() => this.clickHeader("total_vote_percent")}
              >
                <label className="font-size-14">V% total</label>
                {this.renderTriangle("total_vote_percent")}
              </div>
              <div
                className="c-col-4 c-cols"
                onClick={() => this.clickHeader("last_month_vote_percent")}
              >
                <label className="font-size-14">V% last month</label>
                {this.renderTriangle("last_month_vote_percent")}
              </div>
              <div
                className="c-col-5 c-cols"
                onClick={() => this.clickHeader("this_month_vote_percent")}
              >
                <label className="font-size-14">V% this month</label>
                {this.renderTriangle("this_month_vote_percent")}
              </div>
              <div
                className="c-col-6 c-cols"
                onClick={() => this.clickHeader("total_rep")}
              >
                <label className="font-size-14">Total Rep</label>
                {this.renderTriangle("total_rep")}
              </div>
              <div
                className="c-col-7 c-cols"
                onClick={() => this.clickHeader("member_at")}
              >
                <label className="font-size-14">Date became VA</label>
                {this.renderTriangle("member_at")}
              </div>
            </div>
          </div>
          <div className="infinite-body" id="va-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(VATables);
