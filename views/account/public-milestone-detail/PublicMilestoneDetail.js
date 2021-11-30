import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Fade } from "react-reveal";
import { PageHeaderComponent } from "../../../components";
import { getPublicMilestoneDetail } from "../../../utils/Thunk";
import moment from "moment";
import "./public-milestone-detail.scss";

const mapStateToProps = () => {
  return {};
};

class PublicMilestoneDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      data: {},
      isShow: true,
      currentMilestone: null,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const id = params.id;
    this.setState({ id });
    this.getDetail(params.id);
  }

  getDetail(mileId) {
    this.props.dispatch(
      getPublicMilestoneDetail(
        mileId,
        () => {},
        (res) => {
          if (res.success) {
            const data = res.milestone;
            const idx = data.milestones.findIndex((x) => +x.id === +mileId);
            data.milestoneIndex = idx + 1;
            this.setState({
              data,
              currentMilestone: data.milestones[idx],
            });
          }
        }
      )
    );
  }

  render() {
    const { data } = this.state;

    return (
      <div id="public-milestone-page" className="h-100">
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <PageHeaderComponent
            title={`Milestones log for ${data.proposal_id}-${data.milestoneIndex}`}
          />
          <section className="app-infinite-box mb-4">
            <div className="app-infinite-search-wrap">
              <h4>Summary</h4>
            </div>
            <div className="pl-5">
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-2">Milestone status:</td>
                      <td className="font-weight-bold">
                        {data.submitted_time ? "Submitted" : "Not submitted"}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2 pb-2">Paid?:</td>
                      <td className="font-weight-bold">
                        {data.paid ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP email:</td>
                      <td className="font-weight-bold">{data.email}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal number:</td>
                      <td className="font-weight-bold">{data.proposal_id}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal title:</td>
                      <td className="font-weight-bold">
                        {data.proposal_title}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Proposal status:</td>
                      <td className="font-weight-bold">
                        {data.proposal_status}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Milestones in this proposal:</td>
                      <td className="font-weight-bold">
                        {data.milestones?.length}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Milestone title:</td>
                      <td className="font-weight-bold">{data?.title}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Acceptance criteria:</td>
                      <td className="font-weight-bold">{data?.criteria}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP milestone submission URL:</td>
                      <td className="font-weight-bold">{data?.url}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">OP milestone submission notes:</td>
                      <td className="font-weight-bold">{data?.comment}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Grant portion:</td>
                      <td className="font-weight-bold">{data?.grant}</td>
                    </tr>
                    <tr>
                      <td className="pr-2">Code reviewer:</td>
                      <td className="font-weight-bold">
                        {data?.admin_reviewer_email}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Review date:</td>
                      <td className="font-weight-bold">
                        {moment(data?.reviewed_at).format("M/D/YYYY")}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Reviewer notes:</td>
                      <td>
                        <p className="text-pre-wrap font-weight-bold">
                          {data?.notes}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-2">Reviewer attachments:</td>
                      <td className="font-weight-bold">
                        <a
                          className="text-underline"
                          target="_blank"
                          href={data?.support_file_url}
                          rel="noreferrer"
                        >
                          {data?.support_file?.split("/").pop()}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </Fade>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PublicMilestoneDetail));
