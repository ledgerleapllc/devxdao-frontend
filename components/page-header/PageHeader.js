import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import "./page-header.scss";

class PageHeader extends Component {
  clickTitle = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { title, buttonData } = this.props;
    if (buttonData && buttonData.link && buttonData.text) {
      return (
        <div className="global-page-header">
          <a onClick={this.clickTitle}>
            <Icon.ArrowLeft size={20} />
            <label>{title}</label>
          </a>

          <Link
            to={buttonData.link}
            className="btn btn-primary btn-fluid less-small"
          >
            {buttonData.text}
          </Link>
        </div>
      );
    }

    return (
      <div className="global-page-header">
        <a onClick={this.clickTitle}>
          <Icon.ArrowLeft size={20} />
          <label>{title}</label>
        </a>
      </div>
    );
  }
}

export default withRouter(PageHeader);
