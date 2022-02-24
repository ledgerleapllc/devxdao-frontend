import React, { Component } from "react";
import { connect } from "react-redux";
import {
  removeActiveModal,
  showCanvas,
  hideCanvas,
  showAlert,
} from "../../redux/actions";
import "./style.scss";
import { FROM_YEAR } from "../../utils/Constant";
import Checkbox from "../../components/check-box/Checkbox";
import { downloadReport } from "../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ExportReportSelection extends Component {
  constructor(props) {
    const currentYear = new Date().getFullYear();
    super(props);
    this.state = {
      currentYear,
      years: [],
      all: false,
    };
  }

  // Hide Modal
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  selectYear = (e, year) => {
    let { years } = this.state;
    if (e) {
      years.push(year);
    } else {
      years = years.filter((x) => x != year);
    }
    this.setState({ years, all: false });
  };

  selectAll = (e) => {
    this.setState({ all: e, years: [] });
  };

  download = () => {
    const { years, all } = this.state;
    let select = "";
    if (!all) {
      select = years.join(",");
    } else {
      select = "all";
    }
    this.props.dispatch(
      downloadReport(
        { select },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.type === "application/json" || res.success === false) {
            this.props.dispatch(
              showAlert("You can't download this file. Try again later.")
            );
          } else {
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "report.pdf");
            document.body.appendChild(link);
            link.click();
          }
          this.props.dispatch(hideCanvas());
          this.hideModal();
        }
      )
    );
  };

  // Render Content
  render() {
    const { years, all, currentYear } = this.state;

    return (
      <div id="export-report-select-modal">
        <h3>Select Year</h3>
        <div className="select-box">
          {[...Array(currentYear - FROM_YEAR + 1).keys()].map((x, index) => (
            <div key={index} className="my-3">
              <Checkbox
                value={years.includes(FROM_YEAR + x)}
                onChange={(e) => this.selectYear(e, FROM_YEAR + x)}
                text={`${FROM_YEAR + x}`}
              />
            </div>
          ))}
          <div className="my-3">
            <Checkbox
              value={all}
              text="Select All"
              onChange={(e) => this.selectAll(e)}
            />
          </div>
        </div>
        <div id="start-kyc-modal__buttons" className="pt-2">
          <button
            className="btn btn-primary mr-2"
            onClick={this.download}
            disabled={!years.length && !all}
          >
            Export
          </button>
          <button className="btn btn-primary-outline" onClick={this.hideModal}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ExportReportSelection);
