import { Fade } from "react-reveal";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { AlternateEmail, Message, Reply } from "@material-ui/icons";
import { Heart } from "react-feather";
import {
  readDiscourseNotification,
  seeAllDiscourseNotifications,
} from "../../../redux/actions";
import API from "../../../utils/API";

import "./notifications.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    discourseNotifications: state.user.discourseNotifications,
  };
};

class Notifications extends Component {
  componentDidMount() {
    API.notifications(true).then((res) => {
      if (res?.failed) {
        return;
      }

      this.props.dispatch(seeAllDiscourseNotifications());
    });
  }

  getIcon({ notification_type }) {
    switch (notification_type) {
      case 6:
        return <Message />;
      case 1:
        return <AlternateEmail />;
      case 9:
        return <Reply />;
      case 5:
        return <Heart />;
    }
  }

  getTitle({ data, fancy_title, notification_type }) {
    switch (notification_type) {
      case 12:
        return `Earned '${data.badge_name}'`;
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return `[${data.original_username}]: ${data.topic_title}`;
      default:
        return fancy_title;
    }
  }

  getLink({ topic_id, notification_type }) {
    switch (notification_type) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 9:
        return `/app/topics/${topic_id}`;
    }
  }

  handleRead = (notification) => {
    if (notification.read) {
      return;
    }

    API.readNotification(notification.id).then((res) => {
      if (res?.failed) {
        return;
      }

      this.props.dispatch(readDiscourseNotification(notification.id));
    });
  };

  render() {
    const { discourseNotifications } = this.props;

    const NotificationItem = ({ notification }) => {
      const icon = this.getIcon(notification);
      const title = this.getTitle(notification);
      const link = this.getLink(notification);
      const classNames = `notifications-item ${
        notification.read ? "readed" : ""
      }`;

      if (link) {
        return (
          <Link
            onClick={() => this.handleRead(notification)}
            to={link}
            className={classNames}
          >
            {icon}
            {title}
          </Link>
        );
      }

      return (
        <div
          onClick={() => this.handleRead(notification)}
          className={classNames}
        >
          {icon}
          {title}
        </div>
      );
    };

    return (
      <div id="app-notifications-page">
        <Fade distance={"20px"} bottom duration={400} delay={600}>
          <div className="mb-3">
            <button
              onClick={() => this.props.history.push("/app/topics")}
              className="btn btn-primary small"
            >
              Topics
            </button>
          </div>
          <div className="notifications">
            {discourseNotifications.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Notifications));
