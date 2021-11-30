import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { GlobalRelativeCanvasComponent } from "../../../../../components";
import { getDosFee } from "../../../../../utils/Thunk";
import { withRouter } from "react-router-dom";
import "./dos-fee-table.scss";
import Helper from "../../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    reloadAdminTeam: state.admin.reloadAdminTeam,
  };
};

class DosFeeTable extends Component {
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

    const { params } = this.props;
    if (prevProps.params !== params) {
      this.setState({ params: { ...params } });
      setTimeout(() => this.reloadTable());
    }
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("dos-fee-scroll-track");
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

  // Reload Full Table
  reloadTable() {
    this.setState({ page_id: 1, data: [], finished: false }, () => {
      this.getData();
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
      limit: 15,
      ...this.state.params,
    };

    this.props.dispatch(
      getDosFee(
        params,
        () => {
          if (showLoading) this.setState({ loading: true, calling: true });
          else this.setState({ loading: false, calling: true });
        },
        (res) => {
          const result = res.proposals || [];
          const finished = res.finished || false;
          this.props.onTotal({
            totalCC: res.totalCC,
            totalETH: res.totalETH,
          });
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
        <li key={`dos_${item.id}`}>
          <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
            <div className="c-col-1 c-cols">
              <p>{moment(item.created_at).format("M/D/YYYY h:mm A")}</p>
            </div>
            <div className="c-col-2 c-cols">
              <p>{item.id}</p>
            </div>
            <div className="c-col-3 c-cols">
              <p>{item.email}</p>
            </div>
            <div className="c-col-4 c-cols">
              <p className="text-uppercase">{item.type_dos}</p>
            </div>
            <div className="c-col-5 c-cols">
              <p>{Helper.formatPriceNumber(item?.dos_amount || 0, "€")}</p>
            </div>
            <div className="c-col-6 c-cols">
              <p>{item.type_dos === "eth" && item.amount_dos?.toFixed(4)}</p>
            </div>
            <div className="c-col-7 c-cols">
              <p className="break-word">{item.dos_txid}</p>
            </div>
            <div className="c-col-8 c-cols">
              <p>{item.bypass ? "Yes" : "No"}</p>
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
      <div className="dos-fee-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Date Time</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Grant Number</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">OP</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Type</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Amount</label>
              </div>
              <div className="c-col-6 c-cols">
                <label className="font-size-14">ETH Amount</label>
              </div>
              <div className="c-col-7 c-cols">
                <label className="font-size-14">TXID</label>
              </div>
              <div className="c-col-8 c-cols">
                <label className="font-size-14">Bypass?</label>
              </div>
            </div>
          </div>
          <div className="infinite-body" id="dos-fee-scroll-track">
            {loading ? <GlobalRelativeCanvasComponent /> : this.renderResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DosFeeTable));
