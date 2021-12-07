import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import Helper from "../../../../../../utils/Helper";
import "./style.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class BidRanksTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTable: [],
    };
  }

  componentDidMount() {
    const { data, survey } = this.props;
    this.analyze(data, survey);
  }

  componentDidUpdate(prevProps) {
    const { data, survey } = this.props;
    if (prevProps.data != data) {
      this.analyze(data, survey);
    }
  }

  analyze = (data, survey) => {
    let dataTableTemp = survey.survey_rfp_bids.map((x, index) => {
      const temp = data.find((y) => y?.place_choice === index + 1);
      if (temp) {
        return {
          ...temp,
        };
      } else {
        return {
          place_choice: index + 1,
        };
      }
    });
    dataTableTemp = dataTableTemp.sort(
      (a, b) => a?.place_choice - b?.place_choice
    );
    this.setState({ dataTable: [...dataTableTemp] });
  };

  render() {
    return (
      <div className="bid-ranks-user-table infinite-content">
        <div className="infinite-contentInner">
          <div className="infinite-header">
            <div className="infinite-headerInner">
              <div className="c-col-1 c-cols">
                <label className="font-size-14">Your Rank</label>
              </div>
              <div className="c-col-2 c-cols">
                <label className="font-size-14">Bid #</label>
              </div>
              <div className="c-col-3 c-cols">
                <label className="font-size-14">Forum name</label>
              </div>
              <div className="c-col-4 c-cols">
                <label className="font-size-14">Price</label>
              </div>
              <div className="c-col-5 c-cols">
                <label className="font-size-14">Delivery date</label>
              </div>
            </div>
          </div>
          <div className="infinite-body">
            <ul>
              {this.state.dataTable.map((item, index) => (
                <li key={`bid_${index}`}>
                  <div className="infinite-row align-items-center d-flex py-3 font-size-14 font-weight-700">
                    <div className="d-flex align-items-center c-col-1 c-cols">
                      <p className="pr-2">{item.place_choice}</p>
                      {item.bid && (
                        <button
                          className="p-0 btn text-underline color-primary extra-small btn-fluid-small"
                          onClick={() => this.props.onRemove(item.bid - 1)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="c-col-2 c-cols">
                      <p>{item.bid ? item.info?.id : "Not assigned yet"}</p>
                    </div>
                    <div className="c-col-3 c-cols">
                      <p>{item.bid ? item.info?.forum : ""}</p>
                    </div>
                    <div className="c-col-4 c-cols">
                      <p>
                        {item.bid
                          ? Helper.formatPriceNumber(item.info?.amount_of_bid)
                          : ""}
                      </p>
                    </div>
                    <div className="c-col-5 c-cols">
                      <p>
                        {item.bid
                          ? moment(item.info?.delivery_date)
                              .local()
                              .format("M/D/YYYY HH:mm A")
                          : ""}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(BidRanksTable);
