/* eslint-disable prettier/prettier */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import ForumIcon from "@material-ui/icons/Forum";
import { Fade } from "react-reveal";
import Helper from "../../utils/Helper";
import {
  saveUser,
  hideSidebar,
  setActiveModal,
  setDiscourseNotifications,
  loadDiscourseNotifications,
} from "../../redux/actions";
import IconAccounting from "../../public/icons/accounting.svg";
import IconMilestone from "../../public/icons/milestone.svg";
import IconTeam from "../../public/icons/team.svg";
import IconSurvey from "../../public/icons/survey.svg";
import IconInfo from "../../public/icons/info.svg";
import IconVA from "../../public/icons/va.svg";
import IconReport from "../../public/icons/report.svg";
import { clearCache } from "react-router-cache-route";
import API from "../../utils/API";

import "./sidebar.scss";

const mapStateToProps = (state) => {
  return {
    theme: state.global.theme,
    authUser: state.global.authUser,
    discourseNotifications: state.user.discourseNotifications,
  };
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabs: [],
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser?.id) {
      this.setTabs();
      this.fetchNotifications();
    }
  }

  componentDidUpdate(prevProps) {
    const { authUser, discourseNotifications } = this.props;

    if (prevProps.authUser?.id !== authUser.id) {
      this.setTabs();
      this.fetchNotifications();
    }

    if (
      prevProps.discourseNotifications?.seen_notification_id !==
      discourseNotifications?.seen_notification_id
    ) {
      this.setTabs();
    }
  }

  fetchNotifications() {
    this.props.dispatch(loadDiscourseNotifications());

    API.notifications().then((res) => {
      if (res?.failed) {
        return;
      }

      this.props.dispatch(setDiscourseNotifications(res.data));
      this.setTabs();
    });
  }

  checkPermission(permissions, type) {
    return !!permissions?.find((x) => x.name === type)?.is_permission;
  }

  getTopicsLabel() {
    const { discourseNotifications } = this.props;

    const count = discourseNotifications?.notifications.filter(
      (notification) => {
        return notification.id > discourseNotifications.seen_notification_id;
      }
    ).length;

    if (count > 0) {
      return `Topics (${count})`;
    }

    return "Topics";
  }

  setTabs() {
    const { authUser } = this.props;
    let tabsTemp = [];
    if (authUser.is_admin) {
      // Admin Tabs
      tabsTemp = [
        {
          link: "/app",
          label: "Dashboard",
          tabs: [
            {
              link: "/app/discussions",
              label: "Discussions",
              icon: <Icon.FileText size={20} />,
              isShow: true,
            },
            {
              link: "/app/topics",
              label: this.getTopicsLabel(),
              icon: <ForumIcon size={20} />,
              isShow: true,
            },
            {
              link: "/app/votes",
              label: "Votes",
              icon: <Icon.CheckSquare size={20} />,
              isShow: true,
            },
            {
              link: "/app/proposals",
              label: "Proposals",
              icon: <Icon.FolderPlus size={20} />,
              isShow: true,
            },
            {
              link: "/app/all-proposals",
              label: "All Proposals",
              icon: <Icon.Briefcase size={20} />,
              isShow: true,
            },
            {
              link: "/app/settings",
              label: "Settings",
              icon: <Icon.Settings size={20} />,
              isShow: true,
            },
          ],
        },
        {
          link: "",
          label: "Admin Tools",
          tabs: [
            {
              link: "/app/users",
              label: "Portal Users",
              icon: <Icon.Users size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "users")),
            },
            {
              link: "/app/va-directory",
              label: "VA Directory",
              icon: <IconVA size={20} />,
              isShow: true,
            },
            {
              link: "/app/new-proposals",
              label: "New Proposals",
              icon: <Icon.Plus size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "new_proposal")),
            },
            {
              link: "/app/to-formal",
              label: "Move to Formal",
              icon: <Icon.LogIn size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "move_to_formal")),
            },
            {
              link: "/app/grants",
              label: "Grants",
              icon: <Icon.List size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "grants")),
            },
            {
              link: "/app/milestones",
              label: "Milestones",
              icon: <IconMilestone size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "milestones")),
            },
            {
              link: "/app/surveys",
              label: "Surveys",
              icon: <IconSurvey size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "surveys")),
            },
            {
              link: "/app/global-settings",
              label: "Global Settings",
              icon: <Icon.Globe size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(
                    authUser.permissions,
                    "global_settings"
                  )),
            },
            {
              link: "/app/admin-team",
              label: "Teams",
              icon: <IconTeam size={20} />,
              isShow: authUser.is_super_admin,
            },
            {
              link: "/app/accounting",
              label: "Accounting",
              icon: <IconAccounting size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "accounting")),
            },
            {
              link: "/app/report",
              label: "Report",
              icon: <IconReport size={20} />,
              isShow: authUser.is_super_admin || authUser.is_admin,
            },
            {
              link: "/app/emailer",
              label: "Emailer",
              icon: <Icon.AtSign size={20} />,
              isShow:
                authUser.is_super_admin ||
                (!authUser.is_super_admin &&
                  this.checkPermission(authUser.permissions, "emailer")),
            },
            {
              link: "/app/scheme",
              label: "Color Scheme",
              icon: <Icon.Sliders size={20} />,
              isShow: true,
            },
          ],
        },
      ];
    } else if (authUser.is_guest) {
      // Guest
      tabsTemp = [
        {
          link: "/app",
          label: "Dashboard",
          tabs: [
            {
              link: "/app/discussions",
              label: "Discussions",
              icon: <Icon.FileText size={20} />,
              isShow: true,
            },
            {
              link: "/app/votes",
              label: "Votes",
              icon: <Icon.CheckSquare size={20} />,
              isShow: true,
            },
            {
              link: "/app/scheme",
              label: "Color Scheme",
              icon: <Icon.Sliders size={20} />,
              isShow: true,
            },
          ],
        },
      ];
    } else if (authUser.is_member) {
      // Voting Associate
      tabsTemp = [
        {
          link: "/app",
          label: "Dashboard",
          tabs: [
            {
              link: "/app/discussions",
              label: "Discussions",
              icon: <Icon.FileText size={20} />,
              isShow: true,
            },
            {
              link: "/app/topics",
              label: this.getTopicsLabel(),
              icon: <ForumIcon size={20} />,
              isShow: true,
            },
            {
              link: "/app/votes",
              label: "Votes",
              icon: <Icon.CheckSquare size={20} />,
              isShow: true,
            },
            {
              link: "/app/user-surveys",
              label: "Survey",
              icon: <IconSurvey size={20} />,
              isShow: true,
            },
            {
              link: "/app/proposals",
              label: "My Proposals",
              icon: <Icon.FolderPlus size={20} />,
              isShow: true,
            },
            {
              link: "/app/all-proposals",
              label: "All Proposals",
              icon: <Icon.Briefcase size={20} />,
              isShow: true,
            },
            {
              link: "/app/reputation",
              label: "My Reputation",
              icon: <Icon.Droplet size={20} />,
              isShow: true,
            },
            {
              link: "/app/grants",
              label: "My Grants",
              icon: <Icon.List size={20} />,
              isShow: true,
            },
            {
              link: "/app/va-directory",
              label: "VA Directory",
              icon: <IconVA size={20} />,
              isShow: true,
            },
            {
              link: "/app/settings",
              label: "Settings",
              icon: <Icon.Settings size={20} />,
              isShow: true,
            },
            {
              link: "/app/scheme",
              label: "Color Scheme",
              icon: <Icon.Sliders size={20} />,
              isShow: true,
            },
          ],
        },
      ];
    } else {
      // Partipant
      tabsTemp = [
        {
          link: "/app",
          label: "Dashboard",
          tabs: [
            {
              link: "/app/discussions",
              label: "Discussions",
              icon: <Icon.FileText size={20} />,
              isShow: true,
            },
            {
              link: "/app/votes",
              label: "Votes",
              icon: <Icon.CheckSquare size={20} />,
              isShow: true,
            },
            {
              link: "/app/proposals",
              label: "My Proposals",
              icon: <Icon.FolderPlus size={20} />,
              isShow: true,
            },
            {
              link: "/app/all-proposals",
              label: "All Proposals",
              icon: <Icon.Briefcase size={20} />,
              isShow: true,
            },
            {
              link: "/app/reputation",
              label: "My Reputation",
              icon: <Icon.Droplet size={20} />,
              isShow: true,
            },
            {
              link: "/app/grants",
              label: "My Grants",
              icon: <Icon.List size={20} />,
              isShow: true,
            },
            {
              link: "/app/settings",
              label: "Settings",
              icon: <Icon.Settings size={20} />,
              isShow: true,
            },
            {
              link: "/app/scheme",
              label: "Color Scheme",
              icon: <Icon.Sliders size={20} />,
              isShow: true,
            },
          ],
        },
      ];
    }

    this.setState({ tabs: tabsTemp });
  }

  logout = (e) => {
    e.preventDefault();
    Helper.storeUser({});
    this.props.dispatch(saveUser({}));
  };

  hideSidebar = () => {
    this.props.dispatch(hideSidebar());
  };

  clickTab(e, link) {
    e.preventDefault();
    clearCache();
    this.hideSidebar();
    if (link) {
      const { history } = this.props;
      history.push(link);
    }
  }

  clickHelp = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("help"));
  };

  getClassName(path, tab) {
    let className = "";
    if (path == tab.link) className = "active";
    return className;
  }

  renderTabs() {
    const { tabs } = this.state;
    const { history, authUser } = this.props;
    let path = "/app";
    if (history && history.location && history.location.pathname)
      path = history.location.pathname;

    const items = [];
    tabs.forEach((tab, index) => {
      const subItems = [];

      if (tab.tabs && tab.tabs.length) {
        tab.tabs.forEach((subTab, subIndex) => {
          subItems.push(
            <li
              key={`subTabItem_${subIndex}`}
              className={this.getClassName(path, subTab)}
              hidden={!subTab.isShow}
            >
              <a
                className="position-relative"
                onClick={(e) => this.clickTab(e, subTab.link)}
                style={{ color: "inherit" }}
              >
                {((subTab.label === "My Grants" &&
                  !!authUser.check_active_grant) ||
                  (subTab.label === "Survey" && !!authUser.has_survey)) && (
                  <div className="position-absolute" style={{ left: "29px" }}>
                    <IconInfo />
                  </div>
                )}
                <div>{subTab.icon}</div>
                <span>{subTab.label}</span>
              </a>
            </li>
          );
        });
      }

      items.push(
        <li key={`tabItem_${index}`} className={this.getClassName(path, tab)}>
          {tab.link ? (
            <a onClick={(e) => this.clickTab(e, tab.link)}>{tab.label}</a>
          ) : (
            <a>{tab.label}</a>
          )}

          <ul>{subItems}</ul>
        </li>
      );
    });

    items.push(
      <li key="tabItem_logout">
        <a onClick={this.logout}>Sign Out</a>
      </li>
    );

    return <ul>{items}</ul>;
  }

  renderExtra() {
    const { authUser } = this.props;
    if (authUser.is_member || authUser.is_participant) {
      return (
        <div className="d-none d-lg-block text-center mt-4 mb-5">
          <a
            id="get-help-btn"
            className="btn btn-primary-outline small"
            onClick={this.clickHelp}
          >
            Get Help
          </a>
        </div>
      );
    }
    return <Fragment></Fragment>;
  }

  renderRole() {
    const { authUser } = this.props;

    if (authUser.is_super_admin) return "Super Admin";
    else if (authUser.is_admin) return "Admin";
    else if (authUser.is_member) return "Voting Associate";
    else if (authUser.is_proposer) return "Proposer";
    else if (authUser.is_participant) return "Associate";
    else if (authUser.is_guest) return "Guest";
    return "";
  }

  renderKycStatus() {
    const { authUser } = this.props;
    if (!authUser.shuftipro) {
      return (
        // <a onClick={this.startKYC} style={{ cursor: "pointer" }}>
        <span className="text-underline">Not submitted</span>
        // </a>
      );
    }
    if (authUser.shuftipro?.status === "pending") {
      return <span>Pending</span>;
    }
    if (
      authUser.shuftipro?.status === "approved" &&
      authUser.shuftipro?.manual_approved_at
    ) {
      return <span>Manual Review</span>;
    }
    if (authUser.shuftipro?.status === "approved") {
      return <span>Accepted</span>;
    }
    if (authUser.shuftipro?.status === "error") {
      return (
        <span>
          Error{" "}
          <a
            className="text-underline"
            onClick={this.kycError}
            style={{ cursor: "pointer" }}
          >
            (more info)
          </a>
        </span>
      );
    }
    return <span>Submitted</span>;
  }

  render() {
    const { theme, authUser } = this.props;
    let logoPath = "/logo-min.png";
    if (theme == "light") logoPath = "/logoblue-min.png";

    return (
      <div className="app-sidebar-wrap">
        <Fade distance={"20px"} left duration={500} delay={200}>
          <div id="app-sidebar-logo">
            <a onClick={(e) => this.clickTab(e, "/app")}>
              <img src={logoPath} alt="" />
            </a>
            <Icon.X onClick={this.hideSidebar} />
          </div>
          <div className="user-info-box">
            <Fade distance={"20px"} bottom duration={500} delay={400}>
              <p className="welcome-message">Welcome, {authUser?.first_name}</p>
            </Fade>
            <Fade distance={"20px"} bottom duration={500} delay={500}>
              <>
                <label className="txt">
                  User Type: <span>{this.renderRole()}</span>
                </label>
                <br />
                {!authUser?.is_super_admin && !authUser?.is_admin && (
                  <>
                    <label className="txt">
                      KYC status: {this.renderKycStatus()}
                    </label>
                    <br />
                    <label className="txt">
                      Forum name: <span>{authUser?.profile?.forum_name}</span>
                    </label>
                    <br />
                    <label className="txt">
                      User ID: <span>{authUser?.id}</span>
                    </label>
                  </>
                )}
              </>
            </Fade>
          </div>
          <div id="app-sidebar-tabs">{this.renderTabs()}</div>
          {this.renderExtra()}
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Sidebar));
