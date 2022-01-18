import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { Fade } from "react-reveal";
import { GlobalRelativeCanvasComponent } from "../../../../components";
import API from "../../../../utils/API";
import { Reply, Visibility } from "@material-ui/icons";
import { Tooltip } from "@material-ui/core";
import moment from "moment";
import "./topics.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Topics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadMoreLoading: false,
      data: {
        topics: [],
      },
      page: 0,
      calling: false,
      finished: false,
    };
  }

  componentDidMount() {
    this.$body = document.getElementById("app-topics-sectionBody");
    this.$section = document.getElementById("app-topics-section");
    this.getTopics();
    this.startTracking();
  }

  componentWillUnmount() {
    if (this.$elem) this.$elem.removeEventListener("scroll", this.trackScroll);
  }

  startTracking() {
    // IntersectionObserver - We can consider using it later
    this.$elem = document.getElementById("app-topics-sectionBody");
    if (this.$elem) this.$elem.addEventListener("scroll", this.trackScroll);
  }

  // Track Scroll
  trackScroll = () => {
    if (!this.$elem) return;
    if (
      this.$elem.scrollTop + this.$elem.clientHeight + 100 >=
      this.$elem.scrollHeight
    ) {
      this.runNextPage();
    }
  };

  // Handle Search
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

  // Reload Full Table
  reloadTable() {
    this.setState({ page: 1, data: { topics: [] }, finished: false }, () => {
      this.getTopics();
    });
  }

  runNextPage() {
    const { calling, loading, finished, page } = this.state;
    if (calling || loading || finished) return;

    this.setState({ page: page + 1, loadMoreLoading: true }, () => {
      this.getTopics(false);
    });
  }

  getTopics(showLoading = true) {
    let { calling, loading, finished, page, data } = this.state;
    if (loading || calling || finished) return;

    if (showLoading) this.setState({ loading: true, calling: true });
    else this.setState({ loading: false, calling: true });

    API.getTopics(page).then((res) => {
      const result = res.data || [];
      const finished = !res.data.more_topics_url;

      this.setState({
        loading: false,
        calling: false,
        loadMoreLoading: false,
        finished,
        data: {
          ...data,
          ...result,
          topics: [...data.topics, ...(result.topics || [])],
        },
      });
    });
  }

  handleTopic(topic) {
    this.props.history.push(`/app/topics/${topic.id}`);
  }

  renderTopics() {
    const { data, loading } = this.state;

    if (loading) {
      return <GlobalRelativeCanvasComponent />;
    }

    if (!data.topics || !data.topics.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    return (
      <ul>
        {data.topics.map((topic) => (
          <li key={`topic_${topic.id}`} onClick={() => this.handleTopic(topic)}>
            <div className="infinite-row">
              <div className="c-col-0 c-cols">
                <label className="font-size-14">{topic.id}</label>
              </div>
              <div className="c-col-1 c-cols">
                <Tooltip title={topic.title} placement="bottom">
                  <label className="font-size-14 font-weight-700">
                    {topic.title}
                  </label>
                </Tooltip>
              </div>
              <div className="c-col-3 c-cols">
                <div className="topic-image-wrap">
                  <div>
                    <Reply fontSize="small" />
                  </div>
                  <span className="font-size-12">{topic.posts_count}</span>
                </div>
              </div>
              <div className="c-col-3 c-cols">
                <div className="topic-image-wrap">
                  <div>
                    <Visibility fontSize="small" />
                  </div>
                  <span className="font-size-12">{topic.views}</span>
                </div>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">
                  {moment(topic.last_posted_at).local().format("M/D/YYYY")}{" "}
                  {moment(topic.last_posted_at).local().format("h:mm A")}
                </label>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-0 c-cols">
            <label className="font-size-14">#</label>
          </div>
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Topic</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Replies</label>
          </div>
          <div className="c-col-3 c-cols">
            <label className="font-size-14">Views</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Activity</label>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Fade distance={"20px"} bottom duration={200} delay={700}>
        <section id="app-topics-section" className="app-infinite-box">
          <div className="app-infinite-search-wrap">
            <label>
              Topics&nbsp;&nbsp;
              <Icon.Info size={16} />
            </label>
          </div>

          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}
              <div className="infinite-body" id="app-topics-sectionBody">
                {this.renderTopics()}
                {this.state.loadMoreLoading && (
                  <GlobalRelativeCanvasComponent />
                )}
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Topics));
