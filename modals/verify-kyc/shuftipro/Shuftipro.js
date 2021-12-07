/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import "./shuftipro.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Shuftipro extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div id="shuftipro-wrap"></div>;
  }
}

export default connect(mapStateToProps)(Shuftipro);
