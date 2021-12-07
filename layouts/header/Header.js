import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import Helper from "../../utils/Helper";
import { saveUser } from "../../redux/actions";

import "./header.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Header extends Component {
  logout = (e) => {
    e.preventDefault();
    Helper.removeUser();
    this.props.dispatch(saveUser({}));
  };

  render() {
    const { authUser, type } = this.props;

    let className = "";
    let logoImage = "/logo-min.png";
    let iconColor = "#180431";
    if (type == "blue") {
      className = "scheme-blue";
      iconColor = "#ffffff";
      logoImage = "/logoblue-min.png";
    }

    return (
      <header className={className}>
        <div className="custom-container">
          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <Link to="/" id="top-logo">
              <img src={logoImage} alt="" className="img-block" />
            </Link>
          </Fade>

          <Fade distance={"20px"} bottom duration={500} delay={400}>
            <ul>
              {authUser && authUser.id ? (
                <li>
                  <a onClick={this.logout}>
                    <span>
                      <Icon.LogOut color={iconColor} size={14} />
                    </span>
                    <label>Sign Out</label>
                  </a>
                </li>
              ) : (
                <li>
                  <Link to="/login">
                    {/*<img src="/user-icon.png" alt="" /> */}
                    <span>
                      <Icon.User color={iconColor} size={14} />
                    </span>
                    <label>Sign In</label>
                  </Link>
                </li>
              )}
            </ul>
          </Fade>
        </div>
      </header>
    );
  }
}

export default connect(mapStateToProps)(Header);
