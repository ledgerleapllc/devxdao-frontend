import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import { Switch } from "@material-ui/core";
import {
  getEmailerData,
  updateEmailerTriggerAdmin,
  deleteEmailerAdmin,
  updateEmailerTriggerUser,
  updateEmailerTriggerMember,
} from "../../../utils/Thunk";
import {
  showCanvas,
  hideCanvas,
  setCustomModalData,
  setActiveModal,
  showAlert,
} from "../../../redux/actions";

import "./emailer.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    customModalData: state.global.customModalData,
  };
};

class Emailer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      admins: [],
      triggerAdmin: [],
      triggerUser: [],
      triggerMember: [],
    };
  }

  componentDidMount() {
    this.getEmailerData();
  }

  componentDidUpdate(prevProps) {
    const { customModalData } = this.props;
    const { customModalData: customModalDataPrev } = prevProps;

    if (
      (!customModalData["add-emailer-admin"] ||
        !customModalData["add-emailer-admin"].render) &&
      customModalDataPrev["add-emailer-admin"] &&
      customModalDataPrev["add-emailer-admin"].render
    ) {
      this.getEmailerData();
    }
  }

  // Get Emailer Data
  getEmailerData() {
    this.props.dispatch(
      getEmailerData(
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          const data = res.data || {};
          const admins = data.admins || [];
          const triggerAdmin = data.triggerAdmin || [];
          const triggerUser = data.triggerUser || [];
          const triggerMember = data.triggerMember || [];
          this.setState({
            admins,
            triggerAdmin,
            triggerUser,
            triggerMember,
          });
        }
      )
    );
  }

  // Click Add
  clickAdd = (e) => {
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        "add-emailer-admin": {
          render: true,
          title: "Add a new recipient of admin email alerts.",
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  };

  // Click Remove
  clickRemove = (item) => {
    if (!confirm("Are you sure you are going to remove this emailer admin?"))
      return;
    this.props.dispatch(
      deleteEmailerAdmin(
        item.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) this.getEmailerData();
        }
      )
    );
  };

  // Render Infinite Header
  renderHeader() {
    return (
      <div className="infinite-header">
        <div className="infinite-headerInner">
          <div className="c-col-1 c-cols">
            <label className="font-size-14">Email</label>
          </div>
          <div className="c-col-2 c-cols">
            <label className="font-size-14">Action</label>
          </div>
        </div>
      </div>
    );
  }

  // Render Admins
  renderAdmins() {
    const { admins } = this.state;
    const items = [];

    if (!admins || !admins.length) {
      return (
        <div id="infinite-no-result">
          <label className="font-size-14">No Results Found</label>
        </div>
      );
    }

    admins.forEach((item) => {
      items.push(
        <li key={`proposal_${item.id}`}>
          <div className="infinite-row">
            <div className="c-col-1 c-cols">
              <label className="font-size-14">{item.email}</label>
            </div>
            <div className="c-col-2 c-cols">
              <label className="font-size-14">
                <a
                  className="btn btn-danger extra-small btn-fluid-small"
                  onClick={() => this.clickRemove(item)}
                >
                  Remove
                </a>
              </label>
            </div>
          </div>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  // Trigger Admin
  changeTriggerAdmin = (e, item, index) => {
    let { triggerAdmin } = this.state;
    const itemNew = {
      ...item,
      enabled: e.target.checked,
    };
    triggerAdmin[index] = {
      ...triggerAdmin[index],
      ...itemNew,
    };
    this.setState({ triggerAdmin }, () => {
      this.props.dispatch(
        updateEmailerTriggerAdmin(item.id, itemNew, null, null)
      );
    });
  };

  // Trigger Member
  changeTriggerMember = (e, item, index) => {
    let { triggerMember } = this.state;
    const itemNew = {
      ...item,
      enabled: e.target.checked,
    };
    triggerMember[index] = {
      ...triggerMember[index],
      ...itemNew,
    };
    this.setState({ triggerMember }, () => {
      this.props.dispatch(
        updateEmailerTriggerMember(item.id, itemNew, null, null)
      );
    });
  };

  //
  changeTriggerUserMessage = (e, item, index) => {
    let { triggerUser } = this.state;
    const itemNew = {
      ...item,
      content: e.target.value,
    };
    triggerUser[index] = {
      ...triggerUser[index],
      ...itemNew,
    };
    this.setState({ triggerUser });
  };

  //
  changeTriggerMemberMessage = (e, item, index) => {
    let { triggerMember } = this.state;
    const itemNew = {
      ...item,
      content: e.target.value,
    };
    triggerMember[index] = {
      ...triggerMember[index],
      ...itemNew,
    };
    this.setState({ triggerMember });
  };

  //
  saveTriggerUser = (e, index) => {
    e.preventDefault();
    const { triggerUser } = this.state;
    const item = triggerUser[index];
    if (!item.content || !item.content.trim()) {
      this.props.dispatch(showAlert("Please input message content"));
      return;
    }

    this.props.dispatch(
      updateEmailerTriggerUser(
        item.id,
        item,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success)
            this.disableTriggerUserEdit(null, item, index);
        }
      )
    );
  };

  //
  saveTriggerMember = (e, index) => {
    e.preventDefault();
    const { triggerMember } = this.state;
    const item = triggerMember[index];
    if (!item.content || !item.content.trim()) {
      this.props.dispatch(showAlert("Please input message content"));
      return;
    }

    this.props.dispatch(
      updateEmailerTriggerMember(
        item.id,
        item,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success)
            this.disableTriggerMemberEdit(null, item, index);
        }
      )
    );
  };

  // Trigger User
  changeTriggerUser = (e, item, index) => {
    let { triggerUser } = this.state;
    const itemNew = {
      ...item,
      enabled: e.target.checked,
    };
    triggerUser[index] = {
      ...triggerUser[index],
      ...itemNew,
    };
    this.setState({ triggerUser }, () => {
      this.props.dispatch(
        updateEmailerTriggerUser(item.id, itemNew, null, null)
      );
    });
  };

  // Trigger Member
  changeTriggerMember = (e, item, index) => {
    let { triggerMember } = this.state;
    const itemNew = {
      ...item,
      enabled: e.target.checked,
    };
    triggerMember[index] = {
      ...triggerMember[index],
      ...itemNew,
    };
    this.setState({ triggerMember }, () => {
      this.props.dispatch(
        updateEmailerTriggerMember(item.id, itemNew, null, null)
      );
    });
  };

  //
  enableTriggerUserEdit = (e, item, index) => {
    e.preventDefault();
    let { triggerUser } = this.state;
    const itemNew = {
      ...item,
      editing: true,
    };
    triggerUser[index] = {
      ...triggerUser[index],
      ...itemNew,
    };
    this.setState({ triggerUser });
  };

  //
  enableTriggerMemberEdit = (e, item, index) => {
    e.preventDefault();
    let { triggerMember } = this.state;
    const itemNew = {
      ...item,
      editing: true,
    };
    triggerMember[index] = {
      ...triggerMember[index],
      ...itemNew,
    };
    this.setState({ triggerMember });
  };

  //
  disableTriggerUserEdit = (e, item, index) => {
    if (e) e.preventDefault();
    let { triggerUser } = this.state;
    const itemNew = {
      ...item,
      editing: false,
    };
    triggerUser[index] = {
      ...triggerUser[index],
      ...itemNew,
    };
    this.setState({ triggerUser });
  };

  //
  disableTriggerMemberEdit = (e, item, index) => {
    if (e) e.preventDefault();
    let { triggerMember } = this.state;
    const itemNew = {
      ...item,
      editing: false,
    };
    triggerMember[index] = {
      ...triggerMember[index],
      ...itemNew,
    };
    this.setState({ triggerMember });
  };

  // Render Admin Section
  renderTriggerAdmin() {
    const { triggerAdmin } = this.state;
    const items = [];
    if (triggerAdmin && triggerAdmin.length) {
      triggerAdmin.forEach((item, index) => {
        items.push(
          <div className="d-emailer-item" key={`d-emailer-item-${index}`}>
            <div>
              <Switch
                checked={item.enabled ? true : false}
                onChange={(e) => this.changeTriggerAdmin(e, item, index)}
                color="primary"
              />
              <label>{item.title}</label>
            </div>
            <p>{item.content}</p>
          </div>
        );
      });
    }
    return items;
  }

  // Render User Section
  renderTriggerUser() {
    const { triggerUser } = this.state;
    const items = [];
    if (triggerUser && triggerUser.length) {
      triggerUser.forEach((item, index) => {
        items.push(
          <div className="d-emailer-item" key={`d-emailer-item-${index}`}>
            <div>
              <Switch
                checked={item.enabled ? true : false}
                onChange={(e) => this.changeTriggerUser(e, item, index)}
                color="primary"
              />
              <label>{item.title}</label>
            </div>
            {item.editing ? (
              <textarea
                value={item.content}
                onChange={(e) => this.changeTriggerUserMessage(e, item, index)}
              ></textarea>
            ) : (
              <p>{item.content}</p>
            )}
            {item.editing ? (
              <Fragment>
                <a
                  style={{ marginRight: "10px" }}
                  className="btn btn-success small"
                  onClick={(e) => this.saveTriggerUser(e, index)}
                >
                  Save
                </a>
                <a
                  className="btn btn-primary small"
                  onClick={(e) => this.disableTriggerUserEdit(e, item, index)}
                >
                  Cancel Edit
                </a>
              </Fragment>
            ) : (
              <a
                className="btn btn-primary small"
                onClick={(e) => this.enableTriggerUserEdit(e, item, index)}
              >
                Edit Message
              </a>
            )}
          </div>
        );
      });
    }
    return items;
  }

  // Render Member Section
  renderTriggerMember() {
    const { triggerMember } = this.state;
    const items = [];
    if (triggerMember && triggerMember.length) {
      triggerMember.forEach((item, index) => {
        items.push(
          <div className="d-emailer-item" key={`d-emailer-item-${index}`}>
            <div>
              <Switch
                checked={item.enabled ? true : false}
                onChange={(e) => this.changeTriggerMember(e, item, index)}
                color="primary"
              />
              <label>{item.title}</label>
            </div>
            {item.editing ? (
              <textarea
                value={item.content}
                onChange={(e) =>
                  this.changeTriggerMemberMessage(e, item, index)
                }
              ></textarea>
            ) : (
              <p>{item.content}</p>
            )}
            {item.editing ? (
              <Fragment>
                <a
                  style={{ marginRight: "10px" }}
                  className="btn btn-success small"
                  onClick={(e) => this.saveTriggerMember(e, index)}
                >
                  Save
                </a>
                <a
                  className="btn btn-primary small"
                  onClick={(e) => this.disableTriggerMemberEdit(e, item, index)}
                >
                  Cancel Edit
                </a>
              </Fragment>
            ) : (
              <a
                className="btn btn-primary small"
                onClick={(e) => this.enableTriggerMemberEdit(e, item, index)}
              >
                Edit Message
              </a>
            )}
          </div>
        );
      });
    }
    return items;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (!authUser.is_admin) return <Redirect to="/" />;

    return (
      <div id="dashboard-emailer-page">
        <div id="d-emailer-admin-section" className="app-infinite-box">
          <label className="d-block">Emailer Admins</label>

          <div className="infinite-content">
            <div className="infinite-contentInner">
              {this.renderHeader()}
              <div className="infinite-body">{this.renderAdmins()}</div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <a
            className="btn btn-success small btn-fluid"
            onClick={this.clickAdd}
          >
            Add
          </a>
        </div>
        <div className="d-emailer-item-section">
          <label className="d-block mb-4">Admin Email Triggers</label>
          {this.renderTriggerAdmin()}
        </div>
        <div className="d-emailer-item-section">
          <label className="d-block mb-4">User Email Triggers</label>
          {this.renderTriggerUser()}
        </div>
        <div className="d-emailer-item-section">
          <label className="d-block mb-4">Member Email Triggers</label>
          {this.renderTriggerMember()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Emailer));
