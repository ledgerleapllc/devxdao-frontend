/* eslint-disable react/display-name */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
import React, { Component, Fragment, forwardRef } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import * as Icon from "react-feather";
import Dropzone from "react-dropzone";
import { Fade } from "react-reveal";
import {
  BRAND,
  COUNTRYLIST,
  GRANTTYPES,
  LICENSES,
  TAGS,
} from "../../../../utils/Constant";
import ProposalTeamView from "../../shared/proposal-team/ProposalTeam";
import ProposalGrantView from "../../shared/proposal-grant/ProposalGrant";
import ProposalMilestoneView from "../../shared/proposal-milestone/ProposalMilestone";
import ProposalRelationView from "../../shared/proposal-relation/ProposalRelation";
import ProposalCitationView from "../../shared/proposal-citation/ProposalCitation";
import { hideCanvas, showAlert, showCanvas } from "../../../../redux/actions";
import { Checkbox, FormSelectComponent } from "../../../../components";
import Helper from "../../../../utils/Helper";
import {
  setActiveModal,
  setCustomModalData,
  saveDraftBeforeLogout,
} from "../../../../redux/actions";

import "./proposal-final-form.scss";
import {
  createProposalDraft,
  uploadDraftFile,
  checkMentor,
} from "../../../../utils/Thunk";
const Scroll = require("react-scroll");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    saveDraft: state.user.saveDraft,
  };
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const ISDEV =
  process.env.NEXT_PUBLIC_FRONTEND_URL == "http://localhost:3000/" ||
  process.env.NEXT_PUBLIC_FRONTEND_URL == "http://localhost:3004/"
    ? true
    : false;

const AUTO_SAVE_TIMEOUT = 1000 * 60 * 5;

class ProposalFinalForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ids_to_remove: [],
      isSaving: false,
      isSaved: false,
      autoSaveTimeout: null,
      title: ISDEV ? "Proposal #" + getRandomInt(1000) : "",
      short_description: ISDEV
        ? `Pellentesque cursus tempus dolor, ut ullamcorper tellus interdum ac. Quisque vulputate non urna ac porta. Sed interdum dui non purus venenatis, non rhoncus nisl semper. Fusce consectetur porttitor ex, sed imperdiet neque mollis ac. Sed elementum libero turpis. Proin ullamcorper elit eros, id euismod augue sagittis ac. Vivamus fermentum arcu ut est faucibus, sed viverra arcu hendrerit. Nam posuere quam vel massa maximus cursus. Morbi nulla quam, facilisis quis ante in, porta consectetur enim. Quisque bibendum feugiat lectus et varius. Morbi sed posuere quam, nec luctus eros. Sed venenatis diam arcu, a commodo turpis iaculis vel. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam mollis felis vel ligula viverra maximus.`
        : "",
      explanation_benefit: ISDEV
        ? `Duis efficitur vestibulum enim, pulvinar porttitor ligula semper id. Nulla quis erat ullamcorper, porta neque id, pretium libero. Nullam bibendum luctus turpis a accumsan. Sed non pharetra nunc, non egestas elit. Nullam mattis est lorem, commodo gravida ipsum gravida sed. Quisque vulputate est mauris. Ut eget odio hendrerit, commodo sem non, sodales sem. Sed ante augue, auctor quis tempor et, sagittis a augue. Morbi tincidunt eros sem, vel porta justo fermentum nec. Curabitur mattis fermentum dolor, et congue nisi feugiat ac. Cras varius quam ac turpis fringilla euismod. Vivamus pharetra metus eleifend nisi bibendum, sit amet rhoncus nulla semper.`
        : "",
      license: ISDEV ? 1 : -1,
      license_other: "",
      resume: ISDEV ? "http://example.com" : "",
      extra_notes: ISDEV
        ? "Pellentesque cursus tempus dolor, ut ullamcorper"
        : "",
      memberRequired: true,
      members: [
        {
          full_name: ISDEV ? "developer" : "",
          bio: ISDEV ? "Duis efficitur vestibulum enim, pulvinar" : "",
          // address: "",
          // city: "",
          // zip: "",
          // country: "",
        },
      ],
      total_grant: ISDEV ? "1000" : "",
      grants: {},
      citations: [],
      bank_name: "",
      iban_number: "",
      swift_number: "",
      holder_name: "",
      account_number: "",
      bank_address: "",
      bank_city: "",
      bank_country: "",
      bank_zip: "",
      holder_address: "",
      holder_city: "",
      holder_country: "",
      holder_zip: "",
      crypto_address: "",
      crypto_type: "",
      milestones: [
        {
          title: ISDEV ? `Mile #${getRandomInt(1000)}` : "",
          details: ISDEV ? "Pellentesque cursus tempus dolor" : "",
          criteria: ISDEV ? "pulvinar porttitor ligula semper id" : "",
          // kpi: "",
          grant: ISDEV ? "1000" : "",
          deadline: ISDEV ? moment(new Date()).format("M/D/YYYY") : "",
          level_difficulty: ISDEV ? "1" : "",
          checked: ISDEV ? true : false,
        },
      ],
      relationship: ISDEV ? [0, 1, 2, 3, 4] : [],
      received_grant_before: 0,
      grant_id: "",
      has_fulfilled: 0,
      // received_grant: 0,
      // foundational_work: ISDEV
      //   ? `Duis efficitur vestibulum enim, pulvinar porttitor ligula semper id. Nulla quis erat ullamcorper, porta neque id, pretium libero. Nullam bibendum luctus turpis a accumsan. Sed non pharetra nunc, non egestas elit. Nullam mattis est lorem, commodo gravida ipsum gravida sed. Quisque vulputate est mauris. Ut eget odio hendrerit, commodo sem non, sodales sem. Sed ante augue, auctor quis tempor et, sagittis a augue. Morbi tincidunt eros sem, vel porta justo fermentum nec. Curabitur mattis fermentum dolor, et congue nisi feugiat ac. Cras varius quam ac turpis fringilla euismod. Vivamus pharetra metus eleifend nisi bibendum, sit amet rhoncus nulla semper.`
      //   : "",
      files: [],
      sectionError: {
        general: true,
        team: true,
        grant: true,
        milestone: true,
        relationship: true,
      },
      require_membership: false,
      member_reason: "",
      member_benefit: "",
      linkedin: "",
      github: "",
      checked: false,
      code: "",
      codeObject: {},
      codeChecked: false,
      checked0: ISDEV ? true : false,
      checked1: ISDEV ? true : false,
      checked2: ISDEV ? true : false,
      checked3: ISDEV ? true : false,
      checked4: ISDEV ? true : false,
      checked5: ISDEV ? true : false,
      checked6: ISDEV ? true : false,
      checked7: ISDEV ? true : false,
      checkedDeveloper1: ISDEV ? true : false,
      checkedDeveloper2: ISDEV ? true : false,
      checkedDeveloper3: ISDEV ? true : false,
      is_company_or_organization: 0,
      name_entity: "",
      entity_country: "",
      have_mentor: 0,
      name_mentor: "",
      check_mentor: false,
      total_hours_mentor: "",
      // yesNo1: 0,
      // yesNo2: 0,
      // yesNo3: 0,
      // yesNo4: 0,
      // yesNo1Exp: "",
      // yesNo2Exp: "",
      // yesNo3Exp: "",
      // yesNo4Exp: "",
      agree1: ISDEV ? true : false,
      agree2: ISDEV ? true : false,
      agree3: ISDEV ? true : false,
      // formField1: "",
      // formField2: "",
      // purpose: "",
      // purposeOther: "",
      tags: [],
      memberChecked: false,
    };
  }

  initValues(proposal) {
    const title = proposal.title || "";
    const short_description = proposal.short_description || "";
    const explanation_goal = proposal.explanation_goal || "";
    const explanation_benefit = proposal.explanation_benefit || "";
    let license = -1;
    if (proposal.hasOwnProperty("license")) {
      license = +proposal.license;
    }
    const license_other = proposal.license_other || "";
    const resume = proposal.resume || "";
    const extra_notes = proposal.extra_notes || "";
    let total_grant = "";
    if (proposal && proposal.hasOwnProperty("total_grant"))
      total_grant = proposal.total_grant?.toString();

    let citations = [];
    if (proposal.citations && proposal.citations.length) {
      proposal.citations.forEach((citation) => {
        citations.push({
          proposalId: citation.rep_proposal_id,
          explanation: citation.explanation,
          percentage: citation.percentage,
          validProposal: true,
          checked: true,
          proposal: citation.rep_proposal || citation.proposal,
        });
      });
    }

    let bank_name = "";
    let iban_number = "";
    let swift_number = "";
    let holder_name = "";
    let account_number = "";
    let bank_address = "";
    let bank_city = "";
    let bank_country = "";
    let bank_zip = "";
    let holder_address = "";
    let holder_city = "";
    let holder_country = "";
    let holder_zip = "";
    let crypto_address = "";
    let crypto_type = "";

    if (proposal.bank && proposal.bank.id) {
      const { bank } = proposal;
      bank_name = bank.bank_name || "";
      iban_number = bank.iban_number || "";
      swift_number = bank.swift_number || "";
      holder_name = bank.holder_name || "";
      account_number = bank.account_number || "";
      bank_address = bank.bank_address || "";
      bank_city = bank.bank_city || "";
      bank_country = bank.bank_country || "";
      bank_zip = bank.bank_zip || "";
      holder_address = bank.address || "";
      holder_city = bank.city || "";
      holder_country = bank.country || "";
      holder_zip = bank.zip || "";
    }

    if (proposal.crypto && proposal.crypto.id) {
      const { crypto } = proposal;
      crypto_address = crypto.public_address || "";
      crypto_type = crypto.type || "";
    }

    let members = [
      {
        full_name: "",
        bio: "",
        address: "",
        city: "",
        zip: "",
        country: "",
      },
    ];
    let memberChecked = false;
    if (proposal.members && proposal.members.length) {
      members = proposal.members;
      memberChecked = true;
    }

    const grantsData = proposal.grants || [];
    let grants = {};
    grantsData.forEach((item) => {
      const key = `grant_${item.type}`;
      grants[key] = {
        ...item,
        grant: item.grant?.toString(),
        checked: true,
      };
    });
    let milestones = [];
    if (proposal.milestones?.length > 0) {
      milestones = proposal.milestones.map((x) => ({ ...x, checked: true }));
    }

    let temp = (proposal.relationship || "").split(",");
    const relationship = [];
    if (temp && temp.length) {
      temp.forEach((t) => {
        relationship.push(parseInt(t));
      });
    }

    const received_grant_before = proposal.received_grant_before;
    const grant_id = proposal.grant_id || "";
    const has_fulfilled = proposal.has_fulfilled || "";
    const received_grant = proposal.received_grant;
    const foundational_work = proposal.foundational_work || "";
    const files = proposal.files || [];

    const require_membership = proposal.include_membership;
    const member_reason = proposal.member_reason || "";
    const member_benefit = proposal.member_benefit || "";
    const linkedin = proposal.linkedin || "";
    const github = proposal.github || "";
    const is_company_or_organization = proposal.is_company_or_organization || 0;
    const name_entity = proposal.name_entity || "";
    const entity_country = proposal.entity_country || "";
    const have_mentor = proposal.have_mentor || 0;
    const name_mentor = proposal.name_mentor || "";
    const total_hours_mentor = proposal.total_hours_mentor || "";

    this.setState(
      {
        title,
        short_description,
        explanation_benefit,
        explanation_goal,
        license,
        license_other,
        resume,
        extra_notes,
        memberRequired: proposal.member_required ? true : false,
        members,
        memberChecked: memberChecked,
        total_grant,
        grants,
        bank_name,
        iban_number,
        swift_number,
        holder_name,
        account_number,
        bank_address,
        bank_city,
        bank_country,
        bank_zip,
        holder_address,
        holder_city,
        holder_country,
        holder_zip,
        crypto_address,
        crypto_type,
        milestones,
        relationship,
        received_grant_before,
        grant_id,
        has_fulfilled,
        received_grant,
        foundational_work,
        files,
        require_membership,
        member_reason,
        member_benefit,
        linkedin,
        github,
        citations,
        tags: proposal.tags ? proposal.tags.split(",") : [],
        is_company_or_organization,
        name_entity,
        entity_country,
        have_mentor,
        name_mentor,
        total_hours_mentor,
        yesNo1: proposal.yesNo1,
        yesNo2: proposal.yesNo2,
        yesNo3: proposal.yesNo3,
        yesNo4: proposal.yesNo4,
        yesNo1Exp: proposal.yesNo1Exp || "",
        yesNo2Exp: proposal.yesNo2Exp || "",
        yesNo3Exp: proposal.yesNo3Exp || "",
        yesNo4Exp: proposal.yesNo4Exp || "",
        formField1: proposal.formField1 || "",
        formField2: proposal.formField2 || "",
        purpose: proposal.purpose || "",
        purposeOther: proposal.purposeOther || "",
        agree1: !!proposal.agree1,
        agree2: !!proposal.agree2,
        agree3: !!proposal.agree3,
        checkedDeveloper1: !!proposal.checkedDeveloper1,
        checkedDeveloper2: !!proposal.checkedDeveloper2,
        checkedDeveloper3: !!proposal.checkedDeveloper3,
      },
      () => {
        this.checkSectionError();
      }
    );
  }

  componentDidMount() {
    const { proposal } = this.props;
    if (proposal && Object.keys(proposal).length > 0) {
      this.initValues(proposal);
    }
    this.checkSectionError();
    if (this.props.allowAutoSave) this.doAutoSave();
    this.saveDraft();
  }

  componentDidUpdate(prevProps) {
    if (this.props.saveDraft && this.props.saveDraft !== prevProps.saveDraft) {
      this.props.dispatch(saveDraftBeforeLogout(false));
      this.saveDraft(undefined, "Autosave");
    }
  }

  componentWillUnmount() {
    const { autoSaveTimeout } = this.state;
    clearTimeout(autoSaveTimeout);
  }

  doAutoSave() {
    const { autoSaveTimeout } = this.state;
    // clear old Timeout
    clearTimeout(autoSaveTimeout);

    // create new timeout
    const autoSaveTimeoutTemp = setTimeout(() => {
      this.setState({ isSaving: true });
      this.saveDraft();
    }, AUTO_SAVE_TIMEOUT);
    this.setState({ autoSaveTimeout: autoSaveTimeoutTemp });
  }

  saveDraft = (autosave = true, customName = "") => {
    const {
      title,
      short_description,
      explanation_benefit,
      license,
      license_other,
      resume,
      extra_notes,
      memberRequired,
      members,
      total_grant,
      grants,
      bank_name,
      iban_number,
      swift_number,
      holder_name,
      account_number,
      bank_address,
      bank_city,
      bank_country,
      bank_zip,
      holder_address,
      holder_city,
      holder_country,
      holder_zip,
      crypto_type,
      crypto_address,
      milestones,
      citations,
      relationship,
      received_grant_before,
      grant_id,
      has_fulfilled,
      // received_grant,
      // foundational_work,
      require_membership,
      member_reason,
      member_benefit,
      linkedin,
      github,
      codeObject,
      is_company_or_organization,
      name_entity,
      entity_country,
      have_mentor,
      name_mentor,
      total_hours_mentor,
      agree1,
      agree2,
      agree3,
      tags,
      files,
      ids_to_remove,
    } = this.state;

    const grantsData = [];
    for (let i in grants) {
      if (grants[i] && grants[i].checked) {
        const grantItem = {
          ...grants[i],
          grant: Helper.unformatNumber(grants[i].grant),
        };
        grantsData.push(grantItem);
      }
    }

    // Params
    const params = {
      title: customName ? `${title} ${customName}`.trim() : title.trim(),
      short_description: short_description.trim(),
      explanation_benefit: explanation_benefit.trim(),
      license,
      license_other: license_other.trim(),
      total_grant: parseFloat(Helper.unformatNumber(total_grant)),
      memberRequired,
      members: memberRequired ? members : [],
      grants: grantsData,
      bank_name: bank_name.trim(),
      iban_number: iban_number.trim(),
      swift_number: swift_number.trim(),
      holder_name: holder_name.trim(),
      account_number: account_number.trim(),
      bank_address: bank_address.trim(),
      bank_city: bank_city.trim(),
      bank_country: bank_country.trim(),
      bank_zip: bank_zip.trim(),
      holder_address: holder_address.trim(),
      holder_city: holder_city.trim(),
      holder_country: holder_country.trim(),
      holder_zip: holder_zip.trim(),
      crypto_type: crypto_type.trim(),
      crypto_address: crypto_address.trim(),
      milestones,
      citations,
      relationship: relationship.join(","),
      received_grant_before,
      grant_id: `${grant_id}`.trim(),
      has_fulfilled,
      previous_work: "",
      other_work: "",
      include_membership: require_membership,
      member_reason: member_reason.trim(),
      member_benefit: member_benefit.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      sponsor_code_id: codeObject && codeObject.id ? codeObject.id : 0,
      is_company_or_organization,
      name_entity: name_entity.trim(),
      entity_country,
      have_mentor,
      name_mentor: name_mentor.trim(),
      total_hours_mentor,
      agree1,
      agree2,
      agree3,
      tags,
      resume,
      extra_notes,
    };
    if (!title) {
      this.setState({ isSaving: false, isSaved: false });
      if (autosave) {
        this.doAutoSave();
      } else {
        this.props.dispatch(
          showAlert(`Cannot save! Title should be not empty!`, "warning")
        );
      }
      return;
    }
    this.props.dispatch(
      createProposalDraft(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(showAlert(`Save successfully!`, "success"));
            if (files?.length || ids_to_remove?.length) {
              const formData = new FormData();

              if (ids_to_remove?.length)
                formData.append("ids_to_remove", ids_to_remove.join(","));

              files.forEach((file) => {
                if (!file.id) {
                  formData.append("files[]", file);
                  formData.append("names[]", file.name);
                }
              });

              formData.append("proposal_draft_id", res.proposal_draft.id);

              this.props.dispatch(
                uploadDraftFile(
                  formData,
                  () => {},
                  () => {}
                )
              );
            }
          }
          this.props.onSaved();
          this.setState({ isSaving: false, isSaved: true });
          setTimeout(() => {
            this.setState({ isSaved: false });
          }, 3000);
          if (autosave) this.doAutoSave();
        }
      )
    );
  };

  // Check All Section Errors
  checkSectionError() {
    let { sectionError } = this.state;
    const general = this.checkGeneralSection();
    const team = this.checkTeamSection();
    const grant = this.checkGrantSection();
    const milestone = this.checkMilestoneSection();
    const relationship = this.checkRelationSection();
    const compliance = this.checkCompilationSection();

    sectionError = {
      ...sectionError,
      general,
      team,
      grant,
      milestone,
      relationship,
      compliance,
    };

    this.setState({ sectionError });
  }

  // Check Relation Section
  checkRelationSection() {
    const {
      relationship,
      received_grant_before,
      grant_id,
      // received_grant,
      // foundational_work,
      citations,
    } = this.state;

    let error = false;
    if (!relationship || !relationship.length) error = true;
    else if (received_grant_before && !`${grant_id}`.trim()) error = true;
    // else if (received_grant && !foundational_work.trim()) error = true;

    let sum = 0;

    if (citations && citations.length) {
      citations.forEach((citation) => {
        if (
          !citation.proposalId ||
          !citation.explanation ||
          citation.percentage == ""
        )
          error = true;
        else if (
          !citation.checked ||
          !citation.validProposal ||
          !citation.proposal ||
          !citation.proposal.id
        )
          error = true;
        else sum += parseInt(citation.percentage);
      });
    }

    if (!error && sum > 100) error = true;
    return error;
  }

  // Check Relation Section
  checkCompilationSection() {
    const {
      checked0,
      checked1,
      checked2,
      checked3,
      checked4,
      checked5,
      checked6,
      checked7,
      checkedDeveloper1,
      checkedDeveloper2,
      checkedDeveloper3,
      agree1,
      agree2,
      agree3,
    } = this.state;

    if (
      !checked0 ||
      !checked1 ||
      !checked2 ||
      !checked3 ||
      !checked4 ||
      !checked5 ||
      !checked6 ||
      !checked7 ||
      !checkedDeveloper1 ||
      !checkedDeveloper2 ||
      !checkedDeveloper3 ||
      !agree1 ||
      !agree2 ||
      !agree3
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Check Milestone Section
  checkMilestoneSection() {
    const { total_grant, milestones } = this.state;

    let error = false;
    if (!total_grant || parseFloat(Helper.unformatNumber(total_grant)) <= 0) {
      error = true;
    } else {
      let milestone_field_error = false;
      let milestone_amount_error = false;
      let milestone_sum = 0;

      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (
          !milestone.title?.trim() ||
          !milestone.details?.trim() ||
          !milestone.criteria?.trim() ||
          // !milestone.kpi?.trim() ||
          !milestone.deadline?.trim() ||
          !milestone.level_difficulty?.trim() ||
          !milestone.checked
        ) {
          milestone_field_error = true;
        } else if (
          !milestone.grant ||
          parseFloat(Helper.unformatNumber(milestone.grant)) <= 0
        ) {
          milestone_amount_error = true;
        } else {
          milestone_sum += parseFloat(Helper.unformatNumber(milestone.grant));
        }
      }

      milestone_sum = parseFloat(
        Helper.adjustNumericString(milestone_sum.toString(), 2)
      );

      if (milestone_field_error || milestone_amount_error) {
        error = true;
      } else {
        let diff = Math.abs(
          parseFloat(Helper.unformatNumber(total_grant)) - milestone_sum
        );
        diff = parseFloat(Helper.adjustNumericString(diff.toString(), 2));
        if (diff) error = true;
      }
    }

    return error;
  }

  // Check Grant Section
  checkGrantSection() {
    const {
      total_grant,
      grants,
      is_company_or_organization,
      name_entity,
      entity_country,
      have_mentor,
      name_mentor,
      total_hours_mentor,
      check_mentor,
    } = this.state;

    let error = false;
    if (!total_grant || parseFloat(Helper.unformatNumber(total_grant)) <= 0) {
      error = true;
    } else {
      let grant_checked_count = 0;
      let grant_sum = 0;
      let grant_amount_error = false;
      let grant_type_error = false;

      for (let i in grants) {
        if (grants[i] && grants[i].checked) {
          grant_checked_count++;
          if (
            !grants[i].grant ||
            parseFloat(Helper.unformatNumber(grants[i].grant)) <= 0
          ) {
            grant_amount_error = true;
          } else {
            grant_sum += parseFloat(Helper.unformatNumber(grants[i].grant));

            if (
              grants[i].type == GRANTTYPES.length - 1 &&
              !grants[i].type_other
            ) {
              grant_type_error = true;
            }
          }
        }
      }

      grant_sum = parseFloat(
        Helper.adjustNumericString(grant_sum.toString(), 2)
      );

      let diff = Math.abs(
        parseFloat(Helper.unformatNumber(total_grant)) - grant_sum
      );
      diff = parseFloat(Helper.adjustNumericString(diff.toString(), 2));

      if (
        !grant_checked_count ||
        grant_amount_error ||
        grant_type_error ||
        diff
      )
        error = true;
    }

    if (is_company_or_organization) {
      if (!name_entity || !entity_country) {
        error = true;
      }
    }

    if (have_mentor) {
      if (!name_mentor || !total_hours_mentor || !check_mentor) {
        error = true;
      }
    }

    return error;
  }

  // Check General Section
  checkGeneralSection() {
    const {
      title,
      short_description,
      explanation_benefit,
      license,
      license_other,
      resume,
    } = this.state;

    let error = false;
    if (
      !title.trim() ||
      !short_description.trim() ||
      !explanation_benefit.trim() ||
      !resume.trim()
      // !extra_notes.trim()
    )
      error = true;
    else if (license < 0) error = true;
    else if (+license === 5 && !license_other.trim()) error = true;
    return error;
  }

  // Check Team Section
  checkTeamSection() {
    const { members, memberChecked, memberRequired } = this.state;

    if (!memberRequired) return false;

    let error = false;
    if (!memberChecked) return true;

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      // const { full_name, bio, address, city, zip, country } = member;
      const { full_name, bio } = member;

      if (
        !full_name?.trim() ||
        !bio?.trim()
        // !address.trim() ||
        // !city ||
        // !zip ||
        // !country
      ) {
        error = true;
        break;
      }
    }

    return error;
  }

  // Input Field
  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.checkSectionError();
    });
  }

  // Input Euro Field
  inputEuroField(e, key) {
    let value = e.target.value;
    value = Helper.unformatPriceNumber(value);

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    this.setState({ [key]: value }, () => {
      this.checkSectionError();
    });
  }

  // Render License Dropdown
  renderLicenseDropdown() {
    const { license } = this.state;
    const items = [];

    LICENSES.forEach((item, index) => {
      items.push(
        <option key={`option_${index}`} value={item.key}>
          {item.title}
        </option>
      );
    });

    return (
      <Fragment>
        <select
          required
          value={license}
          onChange={(e) => this.inputField(e, "license")}
        >
          <option value="">Select...</option>
          {items}
        </select>
        {license == -1 ? (
          <p className="text-danger font-size-14 mt-2">
            You must select a license type
          </p>
        ) : null}
      </Fragment>
    );
  }

  // Append Files
  appendFiles(extra) {
    let { files } = this.state;
    files = files.concat(extra);

    this.setState({ files });
  }

  // Remove File
  removeFile(index) {
    let { files, ids_to_remove } = this.state;
    const file = files[index];

    if (file && file.id && !ids_to_remove.includes(file.id))
      ids_to_remove.push(file.id);

    files.splice(index, 1);
    this.setState({ files, ids_to_remove });
  }

  // Render Files
  renderFiles() {
    const { files } = this.state;
    if (!files || !files.length) return null;

    const items = [];
    files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <p>{file.name}</p>
          <Icon.X onClick={() => this.removeFile(index)} />
        </li>
      );
    });

    return (
      <div id="files-wrap">
        <label>
          <b>Files:</b>
        </label>
        <ul>{items}</ul>
      </div>
    );
  }

  // Submit Form
  submit = () => {
    const {
      title,
      short_description,
      explanation_benefit,
      license,
      license_other,
      resume,
      extra_notes,
      memberRequired,
      members,
      total_grant,
      grants,
      bank_name,
      iban_number,
      swift_number,
      holder_name,
      account_number,
      bank_address,
      bank_city,
      bank_country,
      bank_zip,
      holder_address,
      holder_city,
      holder_country,
      holder_zip,
      crypto_type,
      crypto_address,
      milestones,
      citations,
      relationship,
      received_grant_before,
      grant_id,
      has_fulfilled,
      // received_grant,
      // foundational_work,
      files,
      require_membership,
      member_reason,
      member_benefit,
      linkedin,
      github,
      checked,
      codeObject,
      checked0,
      checked1,
      checked2,
      checked3,
      checked4,
      checked5,
      checked6,
      checked7,
      is_company_or_organization,
      name_entity,
      entity_country,
      have_mentor,
      name_mentor,
      total_hours_mentor,
      checkedDeveloper1,
      checkedDeveloper2,
      checkedDeveloper3,
      agree1,
      agree2,
      agree3,
      // yesNo1,
      // yesNo1Exp,
      // yesNo2,
      // yesNo2Exp,
      // yesNo3,
      // yesNo3Exp,
      // yesNo4,
      // yesNo4Exp,
      // formField1,
      // formField2,
      // purpose,
      // purposeOther,
      tags,
    } = this.state;

    // Validation
    if (!title.trim()) {
      this.props.dispatch(showAlert("Please input proposal title"));
      return;
    }

    if (!short_description.trim()) {
      this.props.dispatch(showAlert("Please input short description"));
      return;
    }

    if (!explanation_benefit.trim()) {
      this.props.dispatch(
        showAlert(
          `Please input explanation as to how your proposed project would benefit the DEVxDAO ecosystem if applicable`
        )
      );
      return;
    }

    // if (!explanation_goal.trim()) {
    //   this.props.dispatch(
    //     showAlert(
    //       `Please input explanation as to how your proposed Project will achieve DEVxDAO's mission of transparent and open source scientific research and/ or development if applicable`
    //     )
    //   );
    //   return;
    // }

    if (license === "" || license < 0) {
      this.props.dispatch(showAlert("Please select license"));
      return;
    }

    if (+license == 5 && !license_other.trim()) {
      this.props.dispatch(showAlert("Please input other license"));
      return;
    }

    if (!resume.trim()) {
      this.props.dispatch(showAlert("Please input your resume or git"));
      return;
    }

    // if (!extra_notes.trim()) {
    //   this.props.dispatch(
    //     showAlert("Please input any notes or reference about the project")
    //   );
    //   return;
    // }

    let teamError = false;
    if (memberRequired) {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];

        if (
          !member.full_name.trim() ||
          !member.bio.trim()
          // !member.address.trim ||
          // !member.city ||
          // !member.zip ||
          // !member.country
        ) {
          teamError = true;
          break;
        }
      }
    }

    if (teamError) {
      this.props.dispatch(
        showAlert("Please input all the team Voting Associate fields")
      );
      return;
    }

    if (!total_grant || parseFloat(Helper.unformatNumber(total_grant)) <= 0) {
      this.props.dispatch(
        showAlert("Please input total amount you are requesting as a grant")
      );
      return;
    }

    let grant_checked_count = 0;
    let grant_sum = 0;
    let grant_amount_error = false;
    let grant_type_error = false;

    for (let i in grants) {
      if (grants[i] && grants[i].checked) {
        grant_checked_count++;
        if (
          !grants[i].grant ||
          parseFloat(Helper.unformatNumber(grants[i].grant)) <= 0
        ) {
          grant_amount_error = true;
        } else {
          grant_sum += parseFloat(Helper.unformatNumber(grants[i].grant));

          if (
            grants[i].type == GRANTTYPES.length - 1 &&
            !grants[i].type_other
          ) {
            grant_type_error = true;
          }
        }
      }
    }

    grant_sum = parseFloat(Helper.adjustNumericString(grant_sum.toString(), 2));

    let diff = Math.abs(
      parseFloat(Helper.unformatNumber(total_grant)) - grant_sum
    );
    diff = parseFloat(Helper.adjustNumericString(diff.toString(), 2));

    if (!grant_checked_count) {
      this.props.dispatch(
        showAlert("Please select planned uses for your grant funds")
      );
      return;
    }

    if (grant_amount_error) {
      this.props.dispatch(
        showAlert(
          "Please input correct grant amount for the selected planned uses"
        )
      );
      return;
    }

    if (grant_type_error) {
      this.props.dispatch(
        showAlert("Please input use of funds for the other grant type")
      );
      return;
    }

    if (diff) {
      this.props.dispatch(
        showAlert(
          `The total of your milestone is ${Helper.formatPriceNumber(
            grant_sum.toString()
          )} while your requested grant total is ${Helper.formatPriceNumber(
            total_grant.toString()
          )}. This is a different of ${Helper.formatPriceNumber(
            diff.toString()
          )}. Please adjust your numbers to remove this difference.`
        )
      );
      return;
    }

    let milestone_field_error = false;
    let milestone_amount_error = false;
    let milestone_sum = 0;

    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (
        !milestone.title.trim() ||
        !milestone.details.trim() ||
        !milestone.criteria.trim() ||
        // !milestone.kpi.trim() ||
        !milestone.deadline.trim() ||
        !milestone.level_difficulty.trim() ||
        !milestone.checked
      ) {
        milestone_field_error = true;
      } else if (
        !milestone.grant ||
        parseFloat(Helper.unformatNumber(milestone.grant)) <= 0
      ) {
        milestone_amount_error = true;
      } else {
        milestone_sum += parseFloat(Helper.unformatNumber(milestone.grant));
      }
    }

    milestone_sum = parseFloat(
      Helper.adjustNumericString(milestone_sum.toString(), 2)
    );

    if (milestone_field_error) {
      this.props.dispatch(showAlert("Please input all the milestone fields"));
      return;
    }

    if (milestone_amount_error) {
      this.props.dispatch(
        showAlert("Please input the correct grant amount for milestones")
      );
      return;
    }

    diff = Math.abs(
      parseFloat(Helper.unformatNumber(total_grant)) - milestone_sum
    );
    diff = parseFloat(Helper.adjustNumericString(diff.toString(), 2));

    if (diff) {
      this.props.dispatch(
        showAlert(
          `The total of your milestone is ${Helper.formatPriceNumber(
            milestone_sum.toString()
          )} while your requested grant total is ${Helper.formatPriceNumber(
            total_grant.toString()
          )}. This is a different of ${Helper.formatPriceNumber(
            diff.toString()
          )}. Please adjust your numbers to remove this difference.`
        )
      );
      return;
    }

    if (!relationship || !relationship.length) {
      this.props.dispatch(
        showAlert(
          "Please outline your relationship with ETA and Contributors of ETA"
        )
      );
      return;
    }
    if (received_grant_before && !`${grant_id}`.trim()) {
      this.props.dispatch(showAlert("Please input grant ID"));
      return;
    }

    // if (received_grant && !foundational_work.trim()) {
    //   this.props.dispatch(
    //     showAlert(
    //       "Please cite any previous work performed under this Program, which is foundational to your proposed Project"
    //     )
    //   );
    //   return;
    // }

    // Citation Check
    let citation_field_error = false;
    let citation_check_error = false;
    let citation_check_result_error = false;
    let citation_sum = 0;

    if (citations && citations.length) {
      citations.forEach((citation) => {
        if (
          !citation.proposalId ||
          !citation.explanation ||
          citation.percentage == ""
        )
          citation_field_error = true;
        else if (!citation.checked) citation_check_error = true;
        else if (
          !citation.validProposal ||
          !citation.proposal ||
          !citation.proposal.id
        )
          citation_check_result_error = true;
        else citation_sum += parseInt(citation.percentage);
      });
    }

    if (citation_field_error) {
      this.props.dispatch(showAlert("Please input all the citation fields"));
      return;
    } else if (citation_check_error) {
      this.props.dispatch(
        showAlert("Please check the proposal for your citation")
      );
      return;
    } else if (citation_check_result_error) {
      this.props.dispatch(showAlert("Invalid proposal for your citation"));
      return;
    } else if (citation_sum > 100) {
      this.props.dispatch(
        showAlert("Sum of the percentage can not be higher than 100%")
      );
      return;
    }

    if (require_membership) {
      if (!member_reason.trim()) {
        this.props.dispatch(
          showAlert("Please input Why do you want to become a Voting Associate")
        );
        return;
      }

      if (!member_benefit.trim()) {
        this.props.dispatch(
          showAlert(
            `Please input As a Voting Associate, what will you bring to the ${BRAND}?`
          )
        );
        return;
      }

      if (!checked) {
        this.props.dispatch(
          showAlert(
            `Please confirm you will be required to spend 4 hours on a weekly bases deliberating and voting on proposals`
          )
        );
        return;
      }
    }

    // Checkboxes
    if (
      !checked0 ||
      !checked1 ||
      !checked2 ||
      !checked3 ||
      !checked4 ||
      !checked5 ||
      !checked6 ||
      !checked7
    )
      return;
    if (!checkedDeveloper1 || !checkedDeveloper2 || !checkedDeveloper3) return;
    // if (yesNo1 == 1 && !yesNo1Exp) return;
    // if (yesNo2 == 1 && !yesNo2Exp) return;
    // if (yesNo3 == 0 && !yesNo3Exp) return;
    // if (yesNo4 == 1 && !yesNo4Exp) return;
    // if (!formField1 || !formField2) return;
    // if (!purpose) return;
    // if (purpose == "Other" && !purposeOther) return;

    // API Call
    const grantsData = [];
    for (let i in grants) {
      if (grants[i] && grants[i].checked) {
        const grantItem = {
          ...grants[i],
          grant: Helper.unformatNumber(grants[i].grant),
        };
        grantsData.push(grantItem);
      }
    }

    // Params
    const params = {
      title: title.trim(),
      short_description: short_description.trim(),
      explanation_benefit: explanation_benefit.trim(),
      license,
      license_other: license_other.trim(),
      total_grant: parseFloat(Helper.unformatNumber(total_grant)),
      memberRequired,
      members: memberRequired ? members : [],
      grants: grantsData,
      bank_name: bank_name.trim(),
      iban_number: iban_number.trim(),
      swift_number: swift_number.trim(),
      holder_name: holder_name.trim(),
      account_number: account_number.trim(),
      bank_address: bank_address.trim(),
      bank_city: bank_city.trim(),
      bank_country: bank_country.trim(),
      bank_zip: bank_zip.trim(),
      holder_address: holder_address.trim(),
      holder_city: holder_city.trim(),
      holder_country: holder_country.trim(),
      holder_zip: holder_zip.trim(),
      crypto_type: crypto_type.trim(),
      crypto_address: crypto_address.trim(),
      milestones,
      citations,
      relationship: relationship.join(","),
      received_grant_before,
      grant_id: `${grant_id}`.trim(),
      has_fulfilled,
      previous_work: "",
      other_work: "",
      // received_grant,
      // foundational_work: foundational_work.trim(),
      include_membership: require_membership,
      member_reason: member_reason.trim(),
      member_benefit: member_benefit.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      sponsor_code_id: codeObject && codeObject.id ? codeObject.id : 0,
      is_company_or_organization,
      name_entity: name_entity.trim(),
      entity_country,
      have_mentor,
      name_mentor: name_mentor.trim(),
      total_hours_mentor,
      agree1,
      agree2,
      agree3,
      // yesNo1,
      // yesNo1Exp,
      // yesNo2,
      // yesNo2Exp,
      // yesNo3,
      // yesNo3Exp,
      // yesNo4,
      // yesNo4Exp,
      // formField1,
      // formField2,
      // purpose,
      // purposeOther,
      tags,
      resume,
      extra_notes,
    };

    this.props.onChange(params, files, this.state.ids_to_remove);
  };

  toggleCheck() {
    const { checked } = this.state;
    this.setState({ checked: !checked });
  }

  toggleCheckByKey(key) {
    const value = this.state[key];
    this.setState({ [key]: !value }, () => {
      this.checkSectionError();
    });
  }

  toggleCheckboxByKey(key, value) {
    this.setState({ [key]: value }, () => {
      this.checkSectionError();
    });
  }

  toggleRequire = () => {
    const { require_membership } = this.state;
    this.setState({ require_membership: !require_membership });
  };

  // Click Tag
  clickTag(tag) {
    const { tags } = this.state;
    if (!tags.includes(tag)) tags.push(tag);
    else tags.splice(tags.indexOf(tag), 1);
    this.setState({ tags });
  }

  // Check Member Checkbox
  checkMember = () => {
    this.setState({ memberRequired: true }, () => {
      this.checkSectionError();
    });
  };

  checkMentorProposal = () => {
    this.props.dispatch(
      checkMentor(
        { name_mentor: this.state.name_mentor },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.setState({ check_mentor: !!res.success }, () => {
            this.checkSectionError();
          });
        }
      )
    );
  };

  // Uncheck Member Checkbox
  uncheckMember = () => {
    this.setState({ memberRequired: false }, () => {
      this.checkSectionError();
    });
  };

  // Render Content
  render() {
    const {
      title,
      short_description,
      explanation_benefit,
      // explanation_goal,
      license,
      license_other,
      resume,
      extra_notes,
      memberRequired,
      members,
      total_grant,
      grants,
      milestones,
      citations,
      relationship,
      received_grant_before,
      grant_id,
      has_fulfilled,
      // received_grant,
      // foundational_work,
      sectionError,
      checked0,
      checked1,
      checked2,
      checked3,
      checked4,
      checked5,
      checked6,
      checked7,
      checkedDeveloper1,
      checkedDeveloper2,
      checkedDeveloper3,
      is_company_or_organization,
      name_entity,
      entity_country,
      have_mentor,
      name_mentor,
      total_hours_mentor,
      // yesNo1,
      // yesNo2,
      // yesNo3,
      // yesNo4,
      // yesNo1Exp,
      // yesNo2Exp,
      // yesNo3Exp,
      // yesNo4Exp,
      agree1,
      agree2,
      agree3,
      check_mentor,
      // formField1,
      // formField2,
      // purpose,
      // purposeOther,
      tags,
      memberChecked,
    } = this.state;

    let submitDisabled = false;
    for (let i in sectionError) {
      if (sectionError[i]) {
        submitDisabled = true;
        break;
      }
    }

    // Check Checkboxes
    // if (
    //   !checked1 ||
    //   !checked2 ||
    //   !checked3 ||
    //   !checked4 ||
    //   !checked5 ||
    //   !checked6 ||
    //   !checked7
    // )
    //   submitDisabled = true;
    // else if (!checkedDeveloper1 || !checkedDeveloper2 || !checkedDeveloper3)
    //   submitDisabled = true;
    // else if (yesNo1 == 1 && !yesNo1Exp) submitDisabled = true;
    // else if (yesNo2 == 1 && !yesNo2Exp) submitDisabled = true;
    // else if (yesNo3 == 0 && !yesNo3Exp) submitDisabled = true;
    // else if (yesNo4 == 1 && !yesNo4Exp) submitDisabled = true;
    // else if (!formField1) submitDisabled = true;
    // else if (!formField2) submitDisabled = true;
    // else if (!purpose) submitDisabled = true;
    // else if (purpose == "Other" && !purposeOther) submitDisabled = true;

    return (
      <div id="proposal-final-form" className="proposal-final-form">
        <form className="main-box">
          <div id="c-status-general"></div>
          <Fade distance={"20px"} bottom duration={100} delay={500}>
            <div className="app-page-header" style={{ marginTop: "40px" }}>
              <label>General Project Details</label>
              <Icon.Info size={16} />

              {sectionError.general ? (
                <Icon.XCircle color="#EA5454" className="app-page-headerIcon" />
              ) : (
                <Icon.CheckCircle
                  color="#33C333"
                  className="app-page-headerIcon"
                />
              )}
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={500}>
            <div className="c-form-row">
              <label>Title of Proposed Project (limit 10 words)</label>
              <input
                value={title}
                type="text"
                onChange={(e) => this.inputField(e, "title")}
                required
              />
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={500}>
            <div className="c-form-row">
              <label>
                Describe your project in detail. Please include what it does and
                what problem it solves. (limit 1500 words)
              </label>
              <textarea
                value={short_description}
                onChange={(e) => this.inputField(e, "short_description")}
                required
              ></textarea>
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={500}>
            <div className="c-form-row">
              <label>
                {`Explanation as to how your proposed project would benefit the DEVxDAO ecosystem AND/OR support transparent and open source scientific research and/ or development if applicable.`}
              </label>
              <textarea
                value={explanation_benefit}
                onChange={(e) => this.inputField(e, "explanation_benefit")}
                required
              ></textarea>
            </div>
          </Fade>
          {/* <Fade distance={"20px"} bottom duration={300} delay={600}>
            <div className="c-form-row">
              <label>
                {`Explanation as to how your proposed Project will achieve DEVxDAO's mission of transparent and open source scientific research and/ or development if applicable.`}
              </label>
              <textarea
                value={explanation_goal}
                onChange={(e) => this.inputField(e, "explanation_goal")}
                required
              ></textarea>
            </div>
          </Fade> */}
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row">
              <label>{`Under which open source license(s) will you publish any research and development associated with your proposed Project? All research papers or the like should be Creative Commons.`}</label>
              <div className="row">
                <div className="col-md-4">{this.renderLicenseDropdown()}</div>
                {+license === 5 ? (
                  <div className="col-md-4">
                    <input
                      value={license_other}
                      type="text"
                      placeholder="Enter License"
                      onChange={(e) => this.inputField(e, "license_other")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row">
              <label>{`Please link your resume (Linkedin) or Git (For developers)`}</label>
              <div className="row">
                <div className="col-md-4">
                  <input
                    value={resume}
                    type="text"
                    onChange={(e) => this.inputField(e, "resume")}
                    required
                  />
                </div>
              </div>
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row">
              <label>{`Please add any notes or reference about the project, such as similar projects or web pages about APIs to be integrated with your build`}</label>
              <textarea
                value={extra_notes}
                onChange={(e) => this.inputField(e, "extra_notes")}
              ></textarea>
            </div>
          </Fade>
          <div id="c-status-team"></div>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="app-page-headerModern">
              <div className="app-page-headerModern__inner">
                <label>Team Details</label>
                <Icon.Info size={16} />
                {sectionError.team ? (
                  <Icon.XCircle
                    color="#EA5454"
                    className="app-page-headerIcon"
                  />
                ) : (
                  <Icon.CheckCircle
                    color="#33C333"
                    className="app-page-headerIcon"
                  />
                )}
              </div>
              <div className="c-checkbox-item">
                <div
                  className="c-checkbox-itemSymbol"
                  onClick={this.uncheckMember}
                >
                  {!memberRequired ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label className="font-size-14" onClick={this.uncheckMember}>
                  {"I am working on this project alone."}
                </label>
              </div>
              <div className="c-checkbox-item">
                <div
                  className="c-checkbox-itemSymbol"
                  onClick={this.checkMember}
                >
                  {memberRequired ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label className="font-size-14" onClick={this.checkMember}>
                  {
                    "I have a team of at least one of person (you will need to provide information for team members)."
                  }
                </label>
              </div>
            </div>
          </Fade>
          {memberRequired ? (
            <ProposalTeamView
              members={members}
              memberChecked={memberChecked}
              onUpdate={(members) => {
                this.setState({ members }, () => {
                  this.checkSectionError();
                });
              }}
              onUpdateChecked={(memberChecked) => {
                this.setState({ memberChecked }, () => {
                  this.checkSectionError();
                });
              }}
            />
          ) : null}
          <div id="c-status-grant"></div>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="app-page-header">
              <label>Grant Details</label>
              <Icon.Info size={16} />
              {sectionError.grant ? (
                <Icon.XCircle color="#EA5454" className="app-page-headerIcon" />
              ) : (
                <Icon.CheckCircle
                  color="#33C333"
                  className="app-page-headerIcon"
                />
              )}
            </div>
          </Fade>

          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row">
              <div className="row">
                <div className="col-md-8">
                  <label>
                    Please enter the total amount you are requesting as a grant:
                  </label>
                  <input
                    type="text"
                    value={
                      total_grant ? Helper.formatPriceNumber(total_grant) : ""
                    }
                    placeholder="Total in Euros"
                    onChange={(e) => this.inputEuroField(e, "total_grant")}
                    required
                  />
                </div>
              </div>
            </div>
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row mt-5">
              <label>{`Will payments for this work be made to a entity such as your company or organization instead of to you personally?`}</label>
              <div className="c-simple-checkbox-item-group">
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ is_company_or_organization: 0 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {is_company_or_organization ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ is_company_or_organization: 0 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ is_company_or_organization: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {is_company_or_organization ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ is_company_or_organization: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
            </div>
          </Fade>
          {!!is_company_or_organization && (
            <Fade distance={"20px"} bottom duration={100} delay={600}>
              <div className="row mt-5">
                <div className="col-md-6">
                  <div className="c-form-row">
                    <label>What is the name of the entity?</label>
                    <input
                      value={name_entity}
                      type="text"
                      placeholder="Enter name of entity"
                      onChange={(e) => this.inputField(e, "name_entity")}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="c-form-row c-select">
                    <label>
                      Please select the entity country of registration.
                    </label>
                    <FormSelectComponent
                      required
                      placeholder="Please select a country"
                      options={COUNTRYLIST}
                      value={entity_country}
                      onChange={(e) => this.inputField(e, "entity_country")}
                    />
                  </div>
                </div>
              </div>
            </Fade>
          )}
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <ProposalGrantView
              total_grant={total_grant}
              grants={grants}
              onUpdate={(grants) => {
                this.setState({ grants }, () => {
                  this.checkSectionError();
                });
              }}
            />
          </Fade>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="c-form-row mt-5">
              <label>{`Did a Voting Associate of the DEVxDAO assist you during the grant application process as a mentor?`}</label>
              <div className="c-simple-checkbox-item-group">
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ have_mentor: 0 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {have_mentor ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ have_mentor: 0 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ have_mentor: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {have_mentor ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ have_mentor: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
            </div>
          </Fade>
          {!!have_mentor && (
            <Fade distance={"20px"} bottom duration={100} delay={600}>
              <div className="row mt-5">
                <div className="col-md-6">
                  <div className="c-form-row">
                    <label>
                      Please enter the email or handle of the member
                      <span className="pl-1">
                        {check_mentor && <Icon.CheckCircle color="#33C333" />}
                        {!check_mentor && <Icon.XCircle color="#EA5454" />}
                      </span>
                    </label>
                    <div className="d-flex">
                      <input
                        value={name_mentor}
                        type="text"
                        onChange={(e) => this.inputField(e, "name_mentor")}
                        required
                      />
                      <button
                        type="button"
                        className="btn-submit btn btn-primary ml-2"
                        onClick={this.checkMentorProposal}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="c-form-row">
                    <label>
                      How many hours did the mentor help you (approximately)?
                    </label>
                    <input
                      value={total_hours_mentor}
                      type="number"
                      onChange={(e) => this.inputField(e, "total_hours_mentor")}
                      required
                    />
                  </div>
                </div>
              </div>
            </Fade>
          )}
          <div id="c-status-milestone"></div>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <div className="app-page-header">
              <label>Milestone Details</label>
              <Icon.Info size={16} />

              {sectionError.milestone ? (
                <Icon.XCircle color="#EA5454" className="app-page-headerIcon" />
              ) : (
                <Icon.CheckCircle
                  color="#33C333"
                  className="app-page-headerIcon"
                />
              )}
            </div>
          </Fade>
          <div>
            <ProposalMilestoneView
              showAction
              total_grant={total_grant}
              milestones={milestones}
              onUpdate={(milestones) => {
                this.setState({ milestones }, () => {
                  this.checkSectionError();
                });
              }}
            />
          </div>
          <div id="c-status-relationship"></div>
          <div className="app-page-header">
            <label>Relationships and previous work</label>
            <Icon.Info size={16} />

            {sectionError.relationship ? (
              <Icon.XCircle color="#EA5454" className="app-page-headerIcon" />
            ) : (
              <Icon.CheckCircle
                color="#33C333"
                className="app-page-headerIcon"
              />
            )}
          </div>
          <ProposalRelationView
            relationship={relationship}
            onUpdate={(relationship) => {
              this.setState({ relationship }, () => {
                this.checkSectionError();
              });
            }}
          />

          <div className="c-form-row mt-5">
            <label>
              Have you ever received a Grant under this program before?
            </label>
            <div className="c-simple-checkbox-item-group">
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => {
                    this.setState({ received_grant_before: 0 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >
                  {received_grant_before ? (
                    <Icon.Square color="#9B64E6" />
                  ) : (
                    <Icon.CheckSquare color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => {
                    this.setState({ received_grant_before: 0 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >{`No`}</label>
              </div>
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => {
                    this.setState({ received_grant_before: 1 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >
                  {received_grant_before ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => {
                    this.setState({ received_grant_before: 1 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >{`Yes`}</label>
                <input
                  value={grant_id}
                  type="text"
                  placeholder="Enter Proposal Number"
                  onChange={(e) => this.inputField(e, "grant_id")}
                />
              </div>
            </div>
          </div>
          <div className="c-form-row">
            <label>
              If the answer to the previous question is YES, have you entirely
              fulfilled your contractual obligations?
            </label>
            <div className="c-simple-checkbox-item-group">
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => this.setState({ has_fulfilled: 0 })}
                >
                  {has_fulfilled ? (
                    <Icon.Square color="#9B64E6" />
                  ) : (
                    <Icon.CheckSquare color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => this.setState({ has_fulfilled: 0 })}
                >{`No`}</label>
              </div>
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => this.setState({ has_fulfilled: 1 })}
                >
                  {has_fulfilled ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => this.setState({ has_fulfilled: 1 })}
                >{`Yes`}</label>
              </div>
            </div>
          </div>
          <Fade distance={"20px"} bottom duration={100} delay={600}>
            <ProposalCitationView
              showAction={true}
              citations={citations}
              onUpdate={(citations) => {
                this.setState({ citations }, () => {
                  this.checkSectionError();
                });
              }}
            />
          </Fade>
          {/* <div className="c-form-row mt-5">
            <label>{`Are you aware that you or another person received a Grant under this Program for a Project which is foundational to your proposed Project.`}</label>
            <div className="c-simple-checkbox-item-group">
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => {
                    this.setState({ received_grant: 0 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >
                  {received_grant ? (
                    <Icon.Square color="#9B64E6" />
                  ) : (
                    <Icon.CheckSquare color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => {
                    this.setState({ received_grant: 0 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >{`No`}</label>
              </div>
              <div className="c-simple-checkbox-item">
                <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => {
                    this.setState({ received_grant: 1 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >
                  {received_grant ? (
                    <Icon.CheckSquare color="#9B64E6" />
                  ) : (
                    <Icon.Square color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => {
                    this.setState({ received_grant: 1 }, () => {
                      this.checkSectionError();
                    });
                  }}
                >{`Yes`}</label>
              </div>
            </div>
          </div> */}
          {/* <div className="c-form-row mt-5">
            <label>{`If the answer to the prior question is yes, please cite any previous work performed under this Program, which is foundational to your proposed Project`}</label>
            <textarea
              value={foundational_work}
              onChange={(e) => this.inputField(e, "foundational_work")}
            ></textarea>
          </div> */}
          <div className="c-form-row mt-5">
            <label>
              {`Drag and drop a file into this box to upload pitch deck, project architecture, charts, etc.`}
              <br />
              {`( Only PDF files will be accepted )`}
            </label>
            <Dropzone
              accept="application/pdf"
              onDrop={(files) => this.appendFiles(files)}
            >
              {({ getRootProps, getInputProps }) => (
                <section id="c-dropzone">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Icon.Upload color="#9B64E6" />
                    <p className="color-primary">Add Files</p>
                  </div>
                </section>
              )}
            </Dropzone>
            {this.renderFiles()}
          </div>

          <div id="c-proposal-tags" className="c-form-row mt-5">
            <label>Add tags your project:</label>
            <ul>
              {TAGS.map((tag, index) => {
                return (
                  <li key={`tag_${index}`}>
                    <a
                      onClick={() => this.clickTag(tag)}
                      className={
                        tags.includes(tag)
                          ? "btn btn-round btn-primary extra-small btn-fluid-small"
                          : "btn btn-round btn-primary-outline extra-small btn-fluid-small"
                      }
                    >
                      {tag}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div id="c-additional-check-wrap">
            <div className="c-simple-checkbox-item-group mt-4">
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked1}
                  text="I hereby declare that all results, work product, etc. associated with these grant deliverable(s) will be made available under an open-source license. I acknowledge that I am legally responsible to ensure that all parts of this project are open-source."
                  onChange={(val) => this.toggleCheckboxByKey("checked1", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked2}
                  text="I hereby declare that this grant will benefit decentralization and open-source projects generally, pursuant to the mission statement of the ETA, which is to support open source and transparent scientific research of emerging technologies for community building by way of submitting grants to developers and scientists in Switzerland and abroad."
                  onChange={(val) => this.toggleCheckboxByKey("checked2", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked3}
                  text="I hereby declare that this proposed project increases the level of decentralization of various blockchain layer 1 platforms; will produce high-quality open source and transparent scientific research and/or developments that further the decentralization of platforms and organizations; delivers research and development initiatives that are globally applicable; and/or delivers reference implementations of the research and development."
                  onChange={(val) => this.toggleCheckboxByKey("checked3", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked4}
                  text="I hereby declare that my proposed project is in line with international transparency standards; my team has sufficient qualifications, experience and capacity to actually finish the proposed project."
                  onChange={(val) => this.toggleCheckboxByKey("checked4", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked5}
                  text="I hereby declare that I have not built tools and do not intend to build tools to attack a blockchain network."
                  onChange={(val) => this.toggleCheckboxByKey("checked5", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked6}
                  text="I hereby declare that I do not intend to use the Developer Grants for illegal market manipulation."
                  onChange={(val) => this.toggleCheckboxByKey("checked6", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked7}
                  text="I hereby declare that I have not previously failed to fulfill my contractual obligations under an earlier grant agreement between myself and the ETA and/or the DEVxDAO."
                  onChange={(val) => this.toggleCheckboxByKey("checked7", val)}
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checkedDeveloper1}
                  text="I hereby declare that my proposed project will not violate intellectual property rights of any of the DEVxDAO Grant Program Sponsor(s)."
                  onChange={(val) =>
                    this.toggleCheckboxByKey("checkedDeveloper1", val)
                  }
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checkedDeveloper2}
                  text="I hereby declare that my proposed project will not be used to the detriment of these DEVxDAO Grant Program Sponsor(s)."
                  onChange={(val) =>
                    this.toggleCheckboxByKey("checkedDeveloper2", val)
                  }
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checkedDeveloper3}
                  text="I hereby declare that I do not intend to use the Developer Grants to seriously harm any these DEVxDAO Grant Program Sponsor(s) and/or the blockchain network (it being understood that legitimate forms of technical or other competition do not constitute such harm)."
                  onChange={(val) =>
                    this.toggleCheckboxByKey("checkedDeveloper3", val)
                  }
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={agree1}
                  text="I hereby declare that my team complies with the Modern Slavery Act."
                  onChange={(val) => this.toggleCheckboxByKey("agree1", val)}
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={agree2}
                  text="I hereby declare that I have not committed and do not plan to commit fraud, corruption, money laundering, or be involved in a criminal organization."
                  onChange={(val) => this.toggleCheckboxByKey("agree2", val)}
                />
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={agree3}
                  text="I agree that while submitting the final milestone for my project, I will add my project code and/or a summary README file to the Casper and DEVxDAO GitHub repositories (for all development projects) and announce my project completion on at least 1 of my social media channels and mention Casper and the DEVxDAO in my post."
                  onChange={(val) => this.toggleCheckboxByKey("agree3", val)}
                />
                {/* <div
                  className="c-simple-checkbox-itemSymbol"
                  onClick={() => this.toggleCheckByKey("agree3")}
                >
                  {!agree3 ? (
                    <Icon.Square color="#9B64E6" />
                  ) : (
                    <Icon.CheckSquare color="#9B64E6" />
                  )}
                </div>
                <label
                  onClick={() => this.toggleCheckByKey("agree3")}
                  className="d-block"
                >{`I agree that while submitting the final milestone for my project, I will add my project code and/or a summary README file to the Casper and DEVxDAO GitHub repositories (for all development projects) and announce my project completion on at least 1 of my social media channels and mention Casper and the DEVxDAO in my post.`}</label> */}
              </div>
              <div className="c-simple-checkbox-item">
                <Checkbox
                  value={checked0}
                  text="I understand that I may be denied grant approval and/or any payments without further justification if I am a citizen or resident of any country/region for which the U.S. Dept. of the Treasury's Office of Foreign Assets Control (OFAC) administers a sanctions program or that is on the Swiss State Secretariat for Economic Affairs (SECO) Sanctions List."
                  onChange={(val) => this.toggleCheckboxByKey("checked0", val)}
                />
              </div>
              {/* c-simple-checkbox-item end */}
            </div>
            {/* c-simple-checkbox-item-group */}
            {/* <div className="c-form-row mt-5">
              <label>{`Is the encryption of your proposed project based on international standards? If yes, specify.`}</label>
              <div
                className="c-simple-checkbox-item-group"
                style={{ display: "flex", marginTop: "1rem" }}
              >
                <div
                  className="c-simple-checkbox-item"
                  style={{ marginRight: "2rem" }}
                >
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo1: 0 });
                    }}
                  >
                    {yesNo1 ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo1: 0 });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo1: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {yesNo1 ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo1: 1 });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
              {yesNo1 ? (
                <Fragment>
                  <textarea
                    value={yesNo1Exp}
                    onChange={(e) => this.inputField(e, "yesNo1Exp")}
                    required
                  ></textarea>
                  {!yesNo1Exp || !yesNo1Exp.trim() ? (
                    <p className="mt-3 font-size-14 color-danger">{`You selected Yes, your must enter further details in the box`}</p>
                  ) : null}
                </Fragment>
              ) : null}
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`Is the encryption of your proposed project based on an open-source system? If yes, specify.`}</label>
              <div
                className="c-simple-checkbox-item-group"
                style={{ display: "flex", marginTop: "1rem" }}
              >
                <div
                  className="c-simple-checkbox-item"
                  style={{ marginRight: "2rem" }}
                >
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo2: 0 });
                    }}
                  >
                    {yesNo2 ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo2: 0 });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo2: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {yesNo2 ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo2: 1 });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
              {yesNo2 ? (
                <Fragment>
                  <textarea
                    value={yesNo2Exp}
                    onChange={(e) => this.inputField(e, "yesNo2Exp")}
                    required
                  ></textarea>
                  {!yesNo2Exp || !yesNo2Exp.trim() ? (
                    <p className="mt-3 font-size-14 color-danger">{`You selected Yes, your must enter further details in the box`}</p>
                  ) : null}
                </Fragment>
              ) : null}
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`I affirm that my team complies with the Modern Slavery Act. If no, explain.`}</label>
              <div
                className="c-simple-checkbox-item-group"
                style={{ display: "flex", marginTop: "1rem" }}
              >
                <div
                  className="c-simple-checkbox-item"
                  style={{ marginRight: "2rem" }}
                >
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo3: 0 });
                    }}
                  >
                    {yesNo3 ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo3: 0 });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo3: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {yesNo3 ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo3: 1 });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
              {!yesNo3 ? (
                <Fragment>
                  <textarea
                    value={yesNo3Exp}
                    onChange={(e) => this.inputField(e, "yesNo3Exp")}
                    required
                  ></textarea>
                  {!yesNo3Exp || !yesNo3Exp.trim() ? (
                    <p className="mt-3 font-size-14 color-danger">{`You selected No, your must enter further details in the box`}</p>
                  ) : null}
                </Fragment>
              ) : null}
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`Have you committed (or do you plan to commit) fraud, corruption, or are you involved (or plan on getting involved) in a criminal organization or money laundering? If yes, explain.`}</label>
              <div
                className="c-simple-checkbox-item-group"
                style={{ display: "flex", marginTop: "1rem" }}
              >
                <div
                  className="c-simple-checkbox-item"
                  style={{ marginRight: "2rem" }}
                >
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo4: 0 });
                    }}
                  >
                    {yesNo4 ? (
                      <Icon.Square color="#9B64E6" />
                    ) : (
                      <Icon.CheckSquare color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo4: 0 });
                    }}
                  >{`No`}</label>
                </div>
                <div className="c-simple-checkbox-item">
                  <div
                    className="c-simple-checkbox-itemSymbol"
                    onClick={() => {
                      this.setState({ yesNo4: 1 }, () => {
                        this.checkSectionError();
                      });
                    }}
                  >
                    {yesNo4 ? (
                      <Icon.CheckSquare color="#9B64E6" />
                    ) : (
                      <Icon.Square color="#9B64E6" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      this.setState({ yesNo4: 1 });
                    }}
                  >{`Yes`}</label>
                </div>
              </div>
              {yesNo4 ? (
                <Fragment>
                  <textarea
                    value={yesNo4Exp}
                    onChange={(e) => this.inputField(e, "yesNo4Exp")}
                    required
                  ></textarea>
                  {!yesNo4Exp || !yesNo4Exp.trim() ? (
                    <p className="mt-3 font-size-14 color-danger">{`You selected Yes, your must enter further details in the box`}</p>
                  ) : null}
                </Fragment>
              ) : null}
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`This project will be predominantly be represented in what jurisdiction?`}</label>
              <textarea
                value={formField1}
                onChange={(e) => this.inputField(e, "formField1")}
                required
              ></textarea>
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`What is the proposed layer 1 solution for this project?`}</label>
              <textarea
                value={formField2}
                onChange={(e) => this.inputField(e, "formField2")}
                required
              ></textarea>
            </div> */}
            {/* c-form-row */}
            {/* <div className="c-form-row mt-5">
              <label>{`The purpose of this project is:`}</label>
              <div className="row">
                <div className="col-md-4">
                  <select
                    value={purpose}
                    onChange={(e) => this.inputField(e, "purpose")}
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="Social">Social</option>
                    <option value="Finance">Finance</option>
                    <option value="Governance">Governance</option>
                    <option value="Legal">Legal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {purpose == "Other" ? (
                  <div className="col-md-4">
                    <input
                      type="text"
                      value={purposeOther}
                      onChange={(e) => this.inputField(e, "purposeOther")}
                      placeholder="Input Other"
                    />
                  </div>
                ) : null}
              </div>
            </div> */}
            <div id="c-submit-status" className="mobile-submit-status">
              <ul>
                <li>
                  {sectionError.general ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-general"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>General Project Details</label>
                  </Scroll.Link>
                </li>
                <li>
                  {sectionError.team ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-team"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>Team Details</label>
                  </Scroll.Link>
                </li>
                <li>
                  {sectionError.grant ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-grant"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>Grant Details</label>
                  </Scroll.Link>
                </li>
                <li>
                  {sectionError.milestone ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-milestone"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>Milestone Details</label>
                  </Scroll.Link>
                </li>
                <li>
                  {sectionError.relationship ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-relationship"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>Relationships and previous work</label>
                  </Scroll.Link>
                </li>
                <li>
                  {sectionError.compliance ? (
                    <Icon.XCircle color="#EA5454" />
                  ) : (
                    <Icon.CheckCircle color="#33C333" />
                  )}
                  <Scroll.Link
                    to="c-status-relationship"
                    spy={false}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    containerId="app-content-body"
                  >
                    <label>Compliance Checkboxes</label>
                  </Scroll.Link>
                </li>
              </ul>
            </div>
          </div>

          <div id="c-button-wrap" className="d-flex">
            <div className="position-relative">
              <button
                type="button"
                className="mr-2 btn btn-primary-outline large"
                onClick={() => this.saveDraft(false)}
              >
                Save and finish later
              </button>
              {this.state.isSaved && (
                <p className="save-successful">save successful!</p>
              )}
            </div>
            <button
              disabled={submitDisabled}
              type="button"
              className="btn btn-primary large"
              onClick={() => {
                this.props.dispatch(
                  setCustomModalData({
                    "confirm-submit-proposal": {
                      render: true,
                      title: "Are you sure you want to submit this proposal?",
                      onConfirm: () => {
                        this.submit();
                      },
                    },
                  })
                );
                this.props.dispatch(setActiveModal("custom-global-modal"));
              }}
            >
              Submit Grant Proposal
            </button>
          </div>
        </form>
        <div id="c-submit-status" className="pc-submit-status">
          <ul>
            <li>
              {sectionError.general ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-general"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>General Project Details</label>
              </Scroll.Link>
            </li>
            <li>
              {sectionError.team ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-team"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>Team Details</label>
              </Scroll.Link>
            </li>
            <li>
              {sectionError.grant ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-grant"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>Grant Details</label>
              </Scroll.Link>
            </li>
            <li>
              {sectionError.milestone ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-milestone"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>Milestone Details</label>
              </Scroll.Link>
            </li>
            <li>
              {sectionError.relationship ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-relationship"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>Relationships and previous work</label>
              </Scroll.Link>
            </li>
            <li>
              {sectionError.compliance ? (
                <Icon.XCircle color="#EA5454" />
              ) : (
                <Icon.CheckCircle color="#33C333" />
              )}
              <Scroll.Link
                to="c-status-relationship"
                spy={false}
                smooth={true}
                offset={-70}
                duration={500}
                containerId="proposal-final-form"
              >
                <label>Compliance Checkboxes</label>
              </Scroll.Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const withRouterForwardRef = (Component) => {
  const WithRouter = withRouter(({ forwardedRef, ...props }) => (
    <Component ref={forwardedRef} {...props} />
  ));

  return forwardRef((props, ref) => (
    <WithRouter {...props} forwardedRef={ref} />
  ));
};

export default connect(mapStateToProps, undefined, undefined, {
  forwardRef: true,
})(withRouterForwardRef(ProposalFinalForm));
