import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./thank-you.scss";

class ThankYou extends Component {
  render() {
    return (
      <div id="thank-you-page">
        <div className="custom-container">
          <h1>Thank You</h1>
          <p className="font-weight-500 font-size-18">
            {`Thank you for completing the application process. An admin will review your details and you will receive an email within 24 hours permitting you to move ahead or requesting further details.`}
          </p>
          <Link to="/" className="btn btn-primary">
            Close
          </Link>
        </div>
      </div>
    );
  }
}

export default ThankYou;
