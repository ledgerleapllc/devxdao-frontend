import React, { Component } from "react";
import { connect } from "react-redux";
import { setTheme } from "../../../redux/actions";
import Helper from "../../../utils/Helper";

import "./scheme.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Scheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: "",
    };
  }

  componentDidMount() {
    this.setState({ theme: Helper.getTheme() });
  }

  selectTheme(theme) {
    this.setState({ theme });
  }

  setColorTheme = (e) => {
    e.preventDefault();
    const { theme } = this.state;
    Helper.saveTheme(theme);
    this.props.dispatch(setTheme(theme));
  };

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    const { theme } = this.state;

    return (
      <div id="app-scheme-page" className="app-simple-section">
        <label>Select Color Theme</label>
        <ul>
          <li
            className={theme == "light" ? "active" : ""}
            id="light-theme"
            onClick={() => this.selectTheme("light")}
          ></li>
          <li
            className={theme == "metal" ? "active" : ""}
            id="metal-theme"
            onClick={() => this.selectTheme("metal")}
          ></li>
          <li
            className={theme == "dark" ? "active" : ""}
            id="dark-theme"
            onClick={() => this.selectTheme("dark")}
          ></li>
        </ul>
        <a className="btn btn-primary less-small" onClick={this.setColorTheme}>
          Set Color Theme
        </a>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Scheme);
