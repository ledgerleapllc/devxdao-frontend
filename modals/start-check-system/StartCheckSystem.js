import React, { Component } from "react";
import { connect } from "react-redux";
import {
  saveUser,
  removeActiveModal,
  showCanvas,
  hideCanvas,
  setCustomModalData,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { completeStepReview2, sendCheckSystemRequest } from "../../utils/Thunk";

import "./start-check-system.scss";

const mapStateToProps = () => {
  return {};
};

class StartCheckSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked1: false,
      checked2: false,
      surfContent: false,
      showErrorSurf: false,
    };

    this.client = null;
    this.signature_request_id = null;
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    const HelloSign = require("hellosign-embedded");

    this.client = new HelloSign();
    this.client.on("sign", () => {
      // data: signatureId
      this.client.close();
      const params = {
        signature_request_id: this.signature_request_id,
      };
      this.props.dispatch(
        completeStepReview2(
          params,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res && res.success) this.hideModal();
          }
        )
      );
    });
  }

  // Hide Modal
  hideModal = (e) => {
    if (e) e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  // Click Start
  clickStart = (e) => {
    e.preventDefault();
    this.props.dispatch(
      sendCheckSystemRequest(
        {},
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            this.props.dispatch(setCustomModalData({}));
            this.props.dispatch(removeActiveModal());
          }
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

  // Click Logout
  clickLogout = (e) => {
    e.preventDefault();
    this.hideModal();
    Helper.removeUser();
    this.props.dispatch(saveUser({}));
  };

  handleScroll = (e) => {
    if (
      e.target.scrollHeight - e.target.scrollTop <=
        e.target.clientHeight + 10 &&
      !this.state.surfContent
    ) {
      this.setState({ surfContent: true, showErrorSurf: false });
    }
  };

  check = (e, field) => {
    if (!this.state.surfContent) {
      this.setState({ showErrorSurf: true });
    } else {
      this.setState({ [field]: e.target.checked });
    }
  };

  // Render Content
  render() {
    const { checked1, checked2, showErrorSurf, surfContent } = this.state;
    return (
      <div id="start-checksystem-modal">
        <h2>Welcome to the DEVxDAO</h2>
        <p className="mt-2 mb-3">{`Before you access the portal, you must agree to the following terms and conditions. You cannot proceed until you scroll to the bottom, reading the terms as you scroll, and check the two boxes below to confirm your agreement.`}</p>
        <div id="paa-box" onScroll={this.handleScroll}>
          <h4 className="pb-1">EMERGING TECHNOLOGY ASSOCIATION</h4>
          <h5>PROGRAM ASSOCIATE AGREEMENT</h5>
          <p>
            This EMERGING TECHNOLOGY ASSOCIATION PROGRAM ASSOCIATE AGREEMENT
            (this “Program Associate Agreement”) is entered into by and between:{" "}
          </p>
          <p>
            1. EMERGING TECHNOLOGY ASSOCIATION, an independent association (in
            the German language, a “Verein”) established under the laws of
            Switzerland (“ETA”); and
          </p>
          <p>
            2. You, an individual (“you” or “your”, as applicable); as of the
            date you digitally click the box “I have read, understood and agreed
            to be bound by this Program Association Agreement” (the “Effective
            Date”). ETA and you are hereinafter collectively referred to as the
            “Parties”, and individually as a “Party”.
          </p>
          <p>
            “Shared Definitions”. The Emerging Technology Association Shared
            Definitions (the “Shared Definitions”), available at
            https://www.emergingte.ch/policies/ (or such other Internet URL as
            ETA may determine from time to time), are hereby incorporated herein
            by this reference and made a part hereof. Any capitalized terms not
            defined herein shall have the meanings set forth in the Shared
            Definitions.
          </p>
          <h5>WHEREAS: </h5>
          <p>
            (A) As described in the Shared Definitions and elsewhere, ETA
            operates the Program, whereby it makes Grants to Grant Applicants in
            support of its Mission.
          </p>
          <p>
            (B) Participation in the Program, including but not limited to
            applying for and receiving Grants, is available and allowed solely
            for parties who: (i) were Program Applicants by virtue of submitting
            Program Applications to ETA; (ii) had such Program Applications
            reviewed and approved by ETA; (iii) were then designated by ETA as
            Program Associates; and (iv) remain Program Associates.
          </p>
          <p>
            (C) You, as a Program Applicant, desire to submit a Program
            Application to ETA so that ETA may review and consider approving
            your Program Application in connection with you becoming a Program
            Associate.
          </p>
          <h5>
            NOW, THEREFORE, in consideration of the mutual promises set forth
            herein, the Parties agree as follows:{" "}
          </h5>
          <p>
            1. Function of Program Associate Agreement. The terms and conditions
            of this Program Associate Agreement, and everything incorporated by
            reference herein, govern both the Program Application process and
            also the Parties’ legal relationship if and when the Program
            Application is approved by ETA and you become a Program Associate.
          </p>
          <p>
            2. Your Program Application. Upon you submitting your Program
            Application to ETA, ETA shall review your Program Application in
            accordance with the Policies. ETA may request additional content,
            material, and information from you as part of the Program
            Application process and you agree to provide such content, material
            and information in a timely, complete and truthful manner. If your
            Program Application is approved by ETA, ETA shall provide you with
            notice of that approval and designate you as a Program Associate.
            Under no circumstances is ETA obligated or required to approve your
            Program Application, to designate you as a Program Associate, or to
            provide an explanation as to why your Program Application was
            accepted, delayed, or rejected. ETA may suspend, review, update, or
            revoke your Program Associate designation at any time in its sole
            and absolute discretion. You shall promptly provide to ETA and its
            service providers all documents and information requested by ETA and
            its service providers to fulfil its AML/CFT requirements under any
            applicable law.
          </p>
          <p>
            3. Policies. All Policies are hereby incorporated into this Program
            Associate Agreement by this reference and you agree to be bound by
            and comply with the Policies in both their current and any future
            forms. Furthermore, you hereby acknowledge and agree that you have
            read and understood the Policies. You also agree to not access the
            Private Website unless you are and remain designated as a Program
            Associate. In the event of a conflict between any Policy provision
            and any other Policy provision, or any provision of this Program
            Associate Agreement, the most recently published or effective
            provision shall control.
          </p>
          <p>
            IMPORTANT – the Policies are not mere boilerplate. They contain
            material contractual and other terms which affect the Parties’
            rights and obligations, especially your rights and obligations. Do
            NOT sign this Program Associate Agreement unless you have actually
            read, understood, and agreed to be bound by the Policies, in both
            their current and future forms. Keep in mind that ETA may
            unilaterally change the Policies at any time. It is your
            responsibility to periodically review the Policies and confirm that
            you still understand and agree to be bound by them. If now or at any
            time you do not, or no longer, understand or agree to be bound by
            the Policies, you hereby agree to immediately use the Website’s
            account functionality to become “Inactive”, and then to immediately
            cease accessing or making use of the Private Website. Note that
            certain of your legal obligations will remain in effect regardless
            of your Program Associate status and regardless of whether this
            Program Associate Agreement has been terminated (i.e., they
            “survive” termination). For example, you may need to return to ETA
            some or all of a Grant which you received.
          </p>
          <p>
            4. No Member Status. You hereby acknowledge and agree that neither
            being a Program Applicant nor a Program Associate in any way results
            in you becoming a Member, nor results in you having any association
            with or membership in any applicable DAO, including the DevDAO,
            including receiving any payment from either. For clarity, neither
            applying for nor receiving a Grant requires that you be a Member as
            ETA’s internal governance and operations are separate from your
            participation in the Program. Except as set forth in this Program
            Associate Agreement, and any other written agreement entered into
            and fully executed by you and ETA, you are not entitled to any form
            of involvement or interaction with ETA or any applicable DAO,
            including the DevDAO.
          </p>
          <p>
            5. Your Representations, Warranties and Covenants. You hereby
            represent, warrant, and covenant the following: 5.1. You are at
            least 18 years old and have the legal capacity to enter into and be
            bound by this Program Associate Agreement.
          </p>
          <p>
            5.2. The Program Application submitted by you is complete, accurate,
            and true in every respect.
          </p>
          <p>
            5.3. This Program Associate Agreement has been duly executed and
            delivered by you and is enforceable against you in accordance with
            its terms.
          </p>
          <p>
            5.4. Your activities are conducted in compliance with Swiss law and
            other applicable law, including but not limited to intellectual
            property law. In addition, you are generally aware that laws exist
            that prohibit the provision of resources and support to individuals
            and organizations associated with terrorism and that the European
            Union, the U.S. Government and the United Nations Security Council
            have published lists identifying individuals and organizations
            considered to be associated with terrorism.
          </p>
          <p>
            5.5. You are neither domiciled in, a resident of, or physically
            present/located in an Excluded Jurisdiction. The applicable law of
            your country of residence or domicile does not prevent you from
            entering into and complying with this Program Associate Agreement,
            complying with the Policies, or participating in the Program
            (including applying for and receiving a Grant of tokens under the
            Program).
          </p>
          <p>
            5.6. You shall promptly provide written notice to ETA of any events,
            developments, claims, investigations, or proceedings which, if
            adverse or if determined adversely, could reasonably be expected to
            result in a material adverse effect on your ability to comply with
            this Program Associate Agreement.
          </p>
          <p>
            5.7. You will not hand over, assign, make available, share, or
            otherwise transfer to a third party any Website or other login
            credentials provided by ETA to you.
          </p>
          <p>
            6. Assignment. You may not assign your rights or delegate your
            duties under this Program Associate Agreement to any other party.
            Any purported assignment or delegation by you shall be void ab
            initio and of no effect.
          </p>
          <p>
            7. Logos and Trademarks. You shall not use the logos or any
            trademarks of ETA or any Contributor unless you have executed a
            valid license agreement with ETA or any Contributor, as applicable,
            for such use.
          </p>
          <p>
            8. Modification or Amendment. This Program Associate Agreement, all
            annexes, exhibits, schedules, and attachments hereto (all of which
            are hereby incorporated by this reference), and the Policies (all of
            which have been incorporated by reference), and any Grant Agreement
            by and between the Parties, if applicable, collectively constitute
            the entire agreement between the Parties and set out all the
            conditions, understandings and agreements between the Parties
            pertaining to the subject matter of this Program Associate Agreement
            and supersedes all prior agreements, understandings, negotiations
            and discussions, whether oral or written. There are no conditions,
            understandings or other agreements, oral or written, express,
            implied or collateral between the Parties in connection with the
            subject matter of this Program Associate Agreement except as
            specifically set forth in this Program Associate Agreement. No
            modification or amendment of this Program Associate Agreement shall
            be valid unless in writing and signed by both you and ETA. However,
            this provision in no way constrains ETA’s rights and capacities with
            respect to the Policies as set forth in Section 3 hereof.
          </p>
          <p>
            9. Relationship. This Program Associate Agreement shall in no way be
            construed as creating the relationship of principal and agent, of
            partnership (including an “Einfache Gesellschaft” as defined under
            the Swiss Code of Obligations Article 530 Section, et seq.), or of
            joint venture, as between ETA and you, or any other person or entity
            involved in the Program, including any applicable DAO, including the
            DevDAO, or any Contributor. ETA assumes no liability for any loss or
            damage to any person or property arising from the Program. You shall
            not, under any circumstances, represent that you are an agent of
            ETA, any applicable DAO, including the DevDAO, or any Contributor,
            and you shall take all reasonable precautions to avoid any
            perception that such relationship exists.{" "}
          </p>
          <p>
            10. Limitations on Liability. TO THE EXTENT YOU, OR ANY PARTY
            RELATED OR AFFILIATED WITH YOU, SEEKS TO ENFORCE ANY PROVISION OF
            THIS AGREEMENT AGAINST ETA, ITS AFFILIATES (INCLUDING WITHOUT
            LIMITATION TO ANY APPLICABE DAO, INCLUDING THE DEVDAO, AND ALL
            CONTRIBUTORS), AND EACH OF THEIR RESPECTIVE DIRECTORS, OFFICERS,
            EMPLOYEES, AGENTS, JOINT VENTURES AND REPRESENTATIVES (THE “ETA
            PARTIES”), YOU HEREBY AGREE TO INDEMNIFY, DEFEND AND HOLD HARMLESS
            THE ETA PARTIES FROM AND AGAINST ALL DAMAGES, LOSSES, LIABILITIES
            AND EXPENSES (INCLUDING REASONABLE ATTORNEYS’ FEES) ARISING OUT OF
            OR RELATED TO ANY SUCH ACTIONS. THE ETA PARTIES’ AGGREGATE LIABILITY
            ARISING OUT OF OR RELATED TO THIS PROGRAM ASSOCIATE AGREEMENT, AND
            THE TRANSACTIONS AND ACTIVITIES CONTEMPLATED HEREBY, WHETHER ARISING
            OUT OF OR RELATED TO BREACH OF CONTRACT, TORT (INCLUDING
            NEGLIGENCE), OR OTHERWISE, SHALL NOT EXCEED 1’000 SWISS FRANCS. IN
            ANY CASE, LIABILITY FOR SLIGHT NEGLIGENCE SHALL BE ENTIRELY
            EXCLUDED. THE PARTIES AGREE THAT THESE LIMITATIONS CONSTIUTE AN
            ESSENTIAL PART OF THE BARGAIN BETWEEN THE PARTIES AND WILL SURVIVE
            AND APPLY EVEN IF ANY LIMITED REMEDY SPECIFIED HEREIN IS FOUND TO
            HAVE FAILED OF ITS ESSENTIAL PURPOSE.
          </p>
          <p>
            11. Applicable Law and Venue. This Program Associate Agreement and
            the Program shall be governed by the laws of Switzerland, without
            regard to conflict of law principles. Any dispute arising out of or
            in connection with this Program Associate Agreement or the Program
            shall be referred to and finally resolved by the ordinary courts in
            Zug, Switzerland.
          </p>
          <p>
            12. Counterparts. This Program Associate Agreement may be executed,
            by means of digital signature or otherwise, in one or more
            counterparts, all of which will constitute one and the same
            agreement.
          </p>
          <p>
            13. Notices. ETA may contact and provide notices to you using the
            email address included in your Program Application or via the
            communication tools on the Website. You may contact and provide
            notices to ETA via the Website or via notices@emergingte.ch.
          </p>
          <p>14. Confidentiality.</p>
          <p>
            14.1. “Confidential Information” means any and all information of
            ETA, the ETA Parties, and the, whether or not developed in whole or
            in part by you, including without limitation any formula, pattern,
            compilation, program, device, software, method, technique or
            process, that derives independent economic or other value, actual or
            potential, from not being generally known to, and not being readily
            ascertainable by proper means by, other persons who can derive
            economic value from its disclosure or use. Confidential Information
            includes, but is not limited to, trade secrets, and it may relate to
            such matters as research and development, software, and techniques,
            the identity and requirements of users, the identity of vendors, the
            identity of members of the DevDAO and ETA, strategic or financial
            data or plans, and sales and marketing plans and information.
            Confidential Information does not lose its confidential status
            merely because it was known by a limited number of persons or
            entities or because it did not originate entirely within a certain
            group.
          </p>
          <p>
            14.2. The definition of Confidential Information does not include:
            Notwithstanding anything in this Section 1 to the contrary, as used
            in this Agreement, “Confidential Information” shall not mean any of
            the following:
          </p>
          <p>
            I. information that is publicly available or readily ascertainable
            from public information, so long as you were not responsible at any
            time, directly or indirectly, for such Confidential Information
            entering into the public domain without the consent of any Party;
          </p>
          <p>
            Ii. information that is already known to you at the time of its
            disclosure;
          </p>
          <p>
            Iii. information that is received by you from a third party, other
            than any Party, who is not in breach of any confidentiality
            obligations; or
          </p>
          <p>
            Iv.information that was developed by you or another third party
            completely independently of a Party.
          </p>
          <p>
            14.2. The definition of Confidential Information does not include:
            Notwithstanding anything in this Section 1 to the contrary, as used
            in this Agreement, “Confidential Information” shall not mean any of
            the following:
          </p>
          <p>
            14.3 You shall not at any time, directly or indirectly disclose,
            furnish, make use of, or make accessible to any person, firm,
            corporation, or other entity, any Confidential Information developed
            or obtained at any time, including prior to the Effective Date.
            Notwithstanding anything to the contrary contained herein, the
            provisions of this Section 13 shall not apply: (i) when disclosure
            is required by law or by legal process issued by any court,
            arbitrator, mediator or administrative or legislative body
            (including any committee thereof) with apparent jurisdiction to
            order Employee to disclose or make accessible any information;
            provided, however, that Employee shall, to the extent permitted by
            law or such legal process, give immediate notice to the Company upon
            receipt of any legal process that may compel disclosure of
            Confidential Information and that Employee shall, to the extent
            permitted by law or such legal process, refrain from disclosure
            until the Company shall have reasonable opportunity to intervene or
            otherwise act to prevent compulsion of disclosure or to protect its
            Confidential Information, or (ii) with respect to any litigation,
            arbitration or mediation involving the Employment Agreement or any
            other agreement between or among the parties hereto; provided,
            however, that Employee will reasonably agree to such orders or
            agreements that may be necessary to prevent public disclosure of
            Confidential Information.
          </p>
        </div>
        {showErrorSurf && (
          <p className="pt-2 text-danger">
            You must have read to the bottom of the text in the scrollable field
            above before confirming.
          </p>
        )}
        <div className="paa-checkboxes">
          <div>
            <input
              style={{ marginTop: "2px", marginRight: "10px" }}
              id="check1"
              type="checkbox"
              required
              checked={checked1}
              onChange={(e) => this.check(e, "checked1")}
            />
            <label
              className="font-size-14"
              htmlFor="check1"
            >{`I have read, understood and agreed to be bound by this Program Association Agreement.`}</label>
          </div>
          <div>
            <input
              style={{ marginTop: "2px", marginRight: "10px" }}
              id="check2"
              type="checkbox"
              required
              checked={checked2}
              onChange={(e) => this.check(e, "checked2")}
            />
            <label
              className="font-size-14"
              htmlFor="check2"
            >{`I have read, understood and agreed to be bound by the Policies`}</label>
          </div>
        </div>
        <div id="start-checksystem-modal__buttons">
          <button
            className="btn btn-primary"
            onClick={this.clickStart}
            disabled={!checked1 || !checked2 || !surfContent}
          >
            Sign Agreement
          </button>
          <button className="btn btn-danger" onClick={this.clickLogout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StartCheckSystem);
