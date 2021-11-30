import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, withRouter } from "react-router-dom";
import { AppRoutes } from "../../routes";
import HeaderLayout from "../header/Header";

import "./app.scss";

const mapStateToProps = () => {
  return {};
};

class App extends Component {
  render() {
    const { auth } = this.props;

    const className = "outer-page-wrap bg-1";
    const headerType = "default";

    // className = "outer-page-wrap white-scheme bg-2";
    // headerType = "blue";

    // Render View
    return (
      <div className={className}>
        <img id="bg-narrow" src="/tc-min.png" alt="" />
        <img id="bg-wide" src="/bl-min.png" alt="" />
        <img id="bg-square" src="/cr-min.png" alt="" />
        <div id="bg-wave"></div>

        <HeaderLayout type={headerType} />

        <div className="page-wrap">
          <Switch>
            <AppRoutes auth={auth} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(App));
