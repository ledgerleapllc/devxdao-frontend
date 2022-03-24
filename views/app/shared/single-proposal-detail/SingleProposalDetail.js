/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import Helper from "../../../../utils/Helper";
import Dropzone from "react-dropzone";
import { PROPOSAL_TYPES } from "../../../../utils/enum";
import ProposalTeamView from "../../shared/proposal-team/ProposalTeam";
import ProposalMilestoneView from "../../shared/proposal-milestone/ProposalMilestone";
import ProposalCitationView from "../../shared/proposal-citation/ProposalCitation";
import ProposalGrantView from "../../shared/proposal-grant/ProposalGrant";
import {
  BRAND,
  COUNTRYLIST,
  DECIMALS,
  GRANTTYPES,
  LICENSES,
  RELATIONSHIPS,
} from "../../../../utils/Constant";
import {
  setActiveModal,
  setViewPaymentFormData,
  showAlert,
  showCanvas,
  hideCanvas,
  setCustomModalData,
  toggleEditMode,
} from "../../../../redux/actions";

import {
  updateProposalShared,
  submitProposalChange,
  uploadFile,
  checkMentor,
} from "../../../../utils/Thunk";

import "./single-proposal-detail.scss";
import { FormSelectComponent, BasicDatePicker } from "../../../../components";
import {
  Card,
  CardHeader,
  CardBody,
  CardPreview,
  CardContext,
} from "../../../../components/card";

const proposalParams = (proposal) => {
  return {
    id: proposal.id,
    title: proposal.title.trim(),
    things_delivered: proposal.things_delivered?.trim(),
    delivered_at: proposal.delivered_at,
    short_description: proposal.short_description.trim(),
    explanation_benefit: proposal.explanation_benefit.trim(),
    explanation_goal: proposal.explanation_goal.trim(),
    license: proposal.license,
    license_other: (proposal.license_other || "").trim(),
    total_grant: parseFloat(Helper.unformatNumber(proposal.total_grant)),
    memberRequired: !!proposal.member_required,
    member_required: !!proposal.member_required,
    members: proposal.members,
    grants: proposal.grants,
    bank_name: proposal.bank?.bank_name || "",
    iban_number: proposal.bank?.iban_number || "",
    swift_number: proposal.bank?.swift_number || "",
    holder_name: proposal.bank?.holder_name || "",
    account_number: proposal.bank?.account_number || "",
    bank_address: proposal.bank?.bank_address || "",
    bank_city: proposal.bank?.bank_city || "",
    bank_country: proposal.bank?.bank_country || "",
    bank_zip: proposal.bank?.bank_zip || "",
    holder_address: proposal.bank?.holder_address || "",
    holder_city: proposal.bank?.holder_city || "",
    holder_country: proposal.bank?.holder_country || "",
    holder_zip: proposal.bank?.holder_zip || "",
    crypto_type: proposal.crypto?.type || "",
    crypto_address: proposal.crypto?.public_address || "",
    milestones: proposal.milestones,
    citations: proposal.citations.map((x) => {
      if (x.id) {
        return {
          ...x,
          proposalId: x.rep_proposal_id,
          checked: true,
          validProposal: true,
        };
      } else {
        return x;
      }
    }),
    relationship: proposal.relationship,
    received_grant_before: proposal.received_grant_before,
    grant_id: proposal.grant_id || "",
    has_fulfilled: proposal.has_fulfilled,
    previous_work: proposal.previous_work || "",
    other_work: proposal.other_work || "",
    received_grant: proposal.received_grant,
    foundational_work: proposal.foundational_work,
    include_membership: proposal.include_membership,
    member_reason: proposal.member_reason || "",
    member_benefit: proposal.member_benefit || "",
    linkedin: proposal.linkedin || "",
    github: proposal.github || "",
    tags: proposal.tags ? proposal.tags.split(",") : [],
    // yesNo1: proposal.yesNo1,
    // yesNo1Exp: proposal.yesNo1Exp || "",
    // yesNo2: proposal.yesNo2,
    // yesNo2Exp: proposal.yesNo2Exp || "",
    // yesNo3: proposal.yesNo3,
    // yesNo3Exp: proposal.yesNo3Exp || "",
    // yesNo4: proposal.yesNo4,
    // yesNo4Exp: proposal.yesNo4Exp || "",
    // formField1: proposal.formField1,
    // formField2: proposal.formField2,
    // purpose: proposal.purpose,
    // purposeOther: proposal.purposeOther || "",
    resume: proposal.resume,
    extra_notes: proposal.extra_notes,
    is_company_or_organization: proposal.is_company_or_organization || 0,
    name_entity: proposal.name_entity,
    entity_country: proposal.entity_country,
    have_mentor: proposal.have_mentor || 0,
    name_mentor: proposal.name_mentor,
    check_mentor: true,
    total_hours_mentor: proposal.total_hours_mentor,
  };
};

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    settings: state.global.settings,
    editMode: state.admin.editMode,
  };
};

class SingleProposalDetail extends Component {
  constructor(props) {
    super(props);
    const { proposal } = this.props;
    this.state = {
      expanded: false,
      editionMode: false,
      editionField: "",
      editionValue: "",
      proposal,
      allowSave: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.editMode && this.props.editMode !== prevProps.editMode) {
      this.toggleEditMode();
      this.props.dispatch(toggleEditMode(false));
    }
  }

  toggle = (e) => {
    if (e) e.preventDefault();
    const { expanded } = this.state;
    this.setState({
      ...this.state,
      expanded: !expanded,
      editionMode: false,
      editionField: "",
    });
  };

  toggleEditMode = () => {
    const { editionMode } = this.state;

    if (editionMode) {
      // Save
      let { proposal, editionField, editionValue } = this.state;
      const proposalTemp = { ...proposal };
      let whatSection = "";
      let changeTo = "";
      let additionalNotes = "";
      if (editionField) {
        if (editionField === "files") {
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            files: editionValue.files,
          });
          additionalNotes = JSON.stringify({
            files: proposal.files,
          });
          const formData = new FormData();

          if (editionValue.ids_to_remove?.length) {
            formData.append(
              "ids_to_remove",
              editionValue.ids_to_remove.join(",")
            );
          }

          editionValue.files.forEach((file) => {
            if (!file.id) {
              formData.append("files[]", file);
              formData.append("names[]", file.name);
            }
          });
          formData.append("proposal", proposal.id);
          this.props.dispatch(
            uploadFile(
              formData,
              () => {},
              (res) => {
                if (res.success) {
                  this.setState({
                    ...this.state,
                    expanded: true,
                    editionMode: !editionMode,
                    editionField: "",
                    proposal: proposalTemp,
                  });
                  const paramsSubmitProposalChange = {
                    proposal: proposal.id,
                    what_section: whatSection,
                    change_to: changeTo,
                    additional_notes: additionalNotes || "",
                    grant: 0,
                  };
                  this.props.dispatch(
                    submitProposalChange(
                      paramsSubmitProposalChange,
                      () => {},
                      (res) => {
                        this.props.dispatch(hideCanvas());
                        if (res.success) {
                          this.props.dispatch(
                            showAlert(
                              "You've successfully proposed a change",
                              "success"
                            )
                          );
                          this.props.refreshLogs();
                        }
                      },
                      true
                    )
                  );
                } else {
                  this.props.dispatch(hideCanvas());
                  this.setState({
                    ...this.state,
                    expanded: true,
                    editionMode: !editionMode,
                    editionField: "",
                  });
                }
              }
            )
          );
          return;
        }
        if (editionField === "license") {
          proposalTemp.license = editionValue.license;
          proposalTemp.license_other = editionValue.license_other;
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            license: proposalTemp.license,
            license_other: proposalTemp.license_other,
          });
          additionalNotes = JSON.stringify({
            license: proposal.license,
            license_other: proposal.license_other,
          });
        } else if (editionField === "members") {
          proposalTemp.memberRequired = editionValue.memberRequired;
          proposalTemp.member_required = editionValue.memberRequired;
          proposalTemp.members = proposalTemp.memberRequired
            ? editionValue.members
            : [];
          if (proposalTemp.members.length < proposal.members.length) {
            if (proposal.members.length - proposalTemp.members.length === 1) {
              whatSection = `team_member_remove`;
            }
            if (proposal.members.length - proposalTemp.members.length > 1) {
              whatSection = `team_members_remove`;
            }
          } else if (proposalTemp.members.length > proposal.members.length) {
            if (proposalTemp.members.length - proposal.members.length === 1) {
              whatSection = `team_member_add`;
            }
            if (proposalTemp.members.length - proposal.members.length > 1) {
              whatSection = `team_members_add`;
            }
          } else {
            whatSection = `team_member_update`;
          }
          changeTo = JSON.stringify({ members: proposalTemp.members });
          additionalNotes = JSON.stringify({ members: proposal.members });
        } else if (editionField === "milestones") {
          proposalTemp.milestones = editionValue.milestones;
          proposalTemp.total_grant = editionValue.total_grant;
          proposalTemp.grants = proposal.grants.map((x) => ({
            ...x,
            grant: parseFloat(
              (
                (x.grant / proposal.total_grant) *
                proposalTemp.total_grant
              ).toFixed(DECIMALS)
            ),
          }));
          if (proposalTemp.milestones.length < proposal.milestones.length) {
            if (
              proposal.milestones.length - proposalTemp.milestones.length ===
              1
            ) {
              whatSection = `milestone_remove`;
            }
            if (
              proposal.milestones.length - proposalTemp.milestones.length >
              1
            ) {
              whatSection = `milestones_remove`;
            }
          } else if (
            proposalTemp.milestones.length > proposal.milestones.length
          ) {
            if (
              proposalTemp.milestones.length - proposal.milestones.length ===
              1
            ) {
              whatSection = `milestone_add`;
            }
            if (
              proposalTemp.milestones.length - proposal.milestones.length >
              1
            ) {
              whatSection = `milestones_add`;
            }
          } else {
            whatSection = `milestone_update`;
          }
          changeTo = JSON.stringify({ milestones: proposalTemp.milestones });
          additionalNotes = JSON.stringify({ milestones: proposal.milestones });
        } else if (editionField === "citations") {
          proposalTemp.citations = editionValue.citations.map((x) => ({
            ...x,
            rep_proposal_id: +x.proposalId,
            rep_proposal: x.proposal,
          }));
          if (proposalTemp.citations.length < proposal.citations.length) {
            whatSection = `citation_remove`;
            if (
              proposal.citations.length - proposalTemp.citations.length ===
              1
            ) {
              whatSection = `citation_remove`;
            }
            if (proposal.citations.length - proposalTemp.citations.length > 1) {
              whatSection = `citations_remove`;
            }
          } else if (
            proposalTemp.citations.length > proposal.citations.length
          ) {
            if (
              proposalTemp.citations.length - proposal.citations.length ===
              1
            ) {
              whatSection = `citation_add`;
            }
            if (proposalTemp.citations.length - proposal.citations.length > 1) {
              whatSection = `citations_add`;
            }
          } else {
            whatSection = `citation_update`;
          }
          changeTo = JSON.stringify({ citations: proposalTemp.citations });
          additionalNotes = JSON.stringify({ citations: proposal.citations });
        } else if (editionField === "is_company_or_organization") {
          proposalTemp.is_company_or_organization =
            editionValue.is_company_or_organization;
          proposalTemp.entity_country = editionValue.entity_country;
          proposalTemp.name_entity = editionValue.name_entity;
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            is_company_or_organization: proposalTemp.is_company_or_organization,
            entity_country: proposalTemp.entity_country,
            name_entity: proposalTemp.name_entity,
          });
          additionalNotes = JSON.stringify({
            is_company_or_organization: proposal.is_company_or_organization,
            entity_country: proposal.entity_country,
            name_entity: proposal.name_entity,
          });
        } else if (editionField === "have_mentor") {
          proposalTemp.have_mentor = editionValue.have_mentor;
          proposalTemp.name_mentor = editionValue.name_mentor;
          proposalTemp.total_hours_mentor = editionValue.total_hours_mentor;
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            have_mentor: proposalTemp.have_mentor,
            name_mentor: proposalTemp.name_mentor,
            total_hours_mentor: proposalTemp.total_hours_mentor,
          });
          additionalNotes = JSON.stringify({
            have_mentor: proposal.have_mentor,
            name_mentor: proposal.name_mentor,
            total_hours_mentor: proposal.total_hours_mentor,
          });
        } else if (editionField === "grants") {
          const grantsData = [];
          for (let i in editionValue.grants) {
            if (editionValue.grants[i] && editionValue.grants[i].checked) {
              const grantItem = {
                ...editionValue.grants[i],
                grant: Helper.unformatNumber(editionValue.grants[i].grant),
              };
              grantsData.push(grantItem);
            }
          }
          proposalTemp.grants = grantsData;
          proposalTemp.total_grant = editionValue.total_grant;
          proposalTemp.milestones = proposal.milestones.map((x) => ({
            ...x,
            grant: parseFloat(
              (
                (x.grant / proposal.total_grant) *
                proposalTemp.total_grant
              ).toFixed(DECIMALS)
            ),
          }));
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            grants: grantsData,
            total_grant: editionValue.total_grant,
          });
          additionalNotes = JSON.stringify({
            grants: proposal.grants,
            total_grant: editionValue.total_grant,
          });
        } else if (editionField === "total_grant") {
          proposalTemp.total_grant = editionValue.total_grant;
          proposalTemp.grants = proposalTemp.grants.map((x) => ({
            ...x,
            grant: parseFloat(
              (
                (x.grant / proposal.total_grant) *
                proposalTemp.total_grant
              ).toFixed(DECIMALS)
            ),
          }));
          proposalTemp.milestones = proposal.milestones.map((x) => ({
            ...x,
            grant: parseFloat(
              (
                (x.grant / proposal.total_grant) *
                proposalTemp.total_grant
              ).toFixed(DECIMALS)
            ),
          }));
          whatSection = `${editionField}_update`;
          changeTo = JSON.stringify({
            total_grant: editionValue.total_grant,
          });
          additionalNotes = JSON.stringify({
            total_grant: editionValue.total_grant,
          });
        } else {
          proposalTemp[editionField] = editionValue;
          whatSection = `${editionField}_update`;
          changeTo = proposalTemp[editionField];
          additionalNotes = proposal[editionField];
        }
      }
      const params = proposalParams(proposalTemp);

      this.props.dispatch(
        updateProposalShared(
          { id: proposal.id, type: proposal.type },
          params,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            if (res.success) {
              this.setState({
                ...this.state,
                expanded: true,
                editionMode: !editionMode,
                editionField: "",
                proposal: proposalTemp,
              });

              const paramsSubmitProposalChange = {
                proposal: proposal.id,
                what_section: whatSection,
                change_to: changeTo,
                additional_notes: additionalNotes || "",
                grant: 0,
              };

              this.props.dispatch(
                submitProposalChange(
                  paramsSubmitProposalChange,
                  () => {},
                  (res) => {
                    this.props.dispatch(hideCanvas());
                    if (res.success) {
                      this.props.dispatch(
                        showAlert(
                          "You've successfully proposed a change",
                          "success"
                        )
                      );
                      this.props.refreshLogs();
                    }
                  },
                  true
                )
              );
            } else {
              this.props.dispatch(hideCanvas());
              this.setState({
                ...this.state,
                expanded: true,
                editionMode: !editionMode,
                editionField: "",
              });
            }
          }
        )
      );
    } else {
      // Open Edit
      this.setState({
        ...this.state,
        expanded: true,
        editionMode: true,
        editionField: "",
      });
    }
  };

  editField = (field, value) => {
    this.setState({
      ...this.state,
      editionField: field,
      editionValue: value,
    });
  };

  checkProposalChange(key) {
    const { proposal } = this.state;
    if (proposal && proposal.changes) {
      const changes = proposal.changes;

      if (changes[key] && changes[key].id) {
        const changeItem = changes[key];
        const changed = moment(changeItem.created_at)
          .local()
          .format("M/D/YYYY");

        return (
          <Fragment>
            &nbsp;&nbsp;&nbsp;
            <Link
              className="color-primary text-underline"
              to={`/app/proposal/${proposal.id}/change/${changeItem.id}`}
            >
              Changed on {changed}
            </Link>
          </Fragment>
        );
      }
    }

    return null;
  }

  clickViewForm = async (e) => {
    e.preventDefault();
    const { proposal } = this.state;
    if (!proposal || !proposal.id) return null;

    await this.props.dispatch(setViewPaymentFormData(proposal));
    await this.props.dispatch(setActiveModal("view-payment-form"));
  };

  renderLicense() {
    const { proposal } = this.state;
    let license = LICENSES.find((x) => +x.key === +proposal.license)?.title;
    const license_other = proposal.license_other;
    if (license_other) license += " - " + license_other;
    return license;
  }

  renderRelations() {
    const { proposal } = this.state;
    let relations = [];
    const items = [];

    if (proposal.relationship) relations = proposal.relationship.split(",");
    relations = relations.map((i) => parseInt(i));
    relations.sort();

    relations.forEach((relation, index) => {
      items.push(
        <div className="app-spd-relation-item" key={`relation_${index}`}>
          <Icon.CheckSquare color="#9B64E6" />
          <label className="font-weight-700">{RELATIONSHIPS[relation]}</label>
        </div>
      );
    });

    return items;
  }

  // Check Milestone Section
  checkMilestoneSection(total_grant, milestones) {
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
          !milestone.title.trim() ||
          !milestone.details.trim() ||
          !milestone.criteria.trim() ||
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

    return !error;
  }

  checkMembersSection(memberChecked, members) {
    if (!memberChecked) {
      return false;
    } else {
      if (members) {
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const { full_name, bio } = member;
          if (!full_name.trim() || !bio.trim()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  checkPaymentEntity(entityValue) {
    if (entityValue.is_company_or_organization) {
      if (!entityValue.entity_country || !entityValue.name_entity) {
        return false;
      }
    }
    return true;
  }

  checkMentorEntity(entityValue) {
    if (entityValue.have_mentor) {
      if (
        !entityValue.name_mentor ||
        !entityValue.total_hours_mentor ||
        !entityValue.check_mentor
      ) {
        return false;
      }
    }
    return true;
  }

  checkCitationsSection(citations) {
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
      return false;
    } else if (citation_check_error) {
      this.props.dispatch(
        showAlert("Please check the proposal for your citation")
      );
      return false;
    } else if (citation_check_result_error) {
      this.props.dispatch(showAlert("Invalid proposal for your citation"));
      return false;
    } else if (citation_sum > 100) {
      this.props.dispatch(
        showAlert("Sum of the percentage can not be higher than 100%")
      );
      return false;
    }
    return true;
  }

  inputField(e) {
    let val;
    let canSave = true;
    if (this.state.editionField === "license") {
      val = {
        license: e.license,
        license_other: e.license_other,
      };
      if (!e.license) {
        canSave = false;
      }
    } else if (this.state.editionField === "members") {
      val = e;
      canSave = this.checkMembersSection(e.memberChecked, e.members);
    } else if (this.state.editionField === "milestones") {
      val = e;
      val.total_grant = parseFloat(e.total_grant.toFixed(5));
      canSave = this.checkMilestoneSection(val.total_grant, e.milestones);
    } else if (this.state.editionField === "citations") {
      val = e;
      canSave = this.checkCitationsSection(e.citations);
    } else if (this.state.editionField === "extra_notes") {
      val = e.target.value;
      canSave = true;
    } else if (this.state.editionField === "is_company_or_organization") {
      val = e;
      canSave = this.checkPaymentEntity(e);
    } else if (this.state.editionField === "have_mentor") {
      val = e;
      canSave = this.checkMentorEntity(e);
    } else if (this.state.editionField === "grants") {
      val = e;
      let total = 0;
      Object.keys(val.grants).forEach(
        (key) => (total = total + +val.grants[key].grant)
      );
      val.total_grant = parseFloat(total.toFixed(5));
      canSave = !this.checkGrantSection(val);
    } else if (this.state.editionField === "total_grant") {
      val = e;
      canSave = !!val.total_grant;
    } else if (this.state.editionField === "delivered_at") {
      try {
        val = moment(e).local().format("YYYY-MM-DD");
      } catch (e) {
        canSave = false;
      }
      if (!val) {
        canSave = false;
      }
    } else {
      val = e.target.value;
      if (!val) {
        canSave = false;
      }
    }
    this.setState({
      ...this.state,
      editionValue: val,
      allowSave: canSave,
    });
  }

  // Append Files
  appendFiles(extra) {
    const { editionValue } = this.state;
    const files = editionValue.files.concat(extra);
    editionValue.files = files;
    this.setState({ editionValue });
  }

  checkGrantSection(grantsData) {
    const { total_grant, grants } = grantsData;

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

    return error;
  }

  checkMentorProposal = () => {
    const { editionValue } = this.state;
    this.props.dispatch(
      checkMentor(
        { name_mentor: editionValue.name_mentor },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.inputField({
            ...this.state.editionValue,
            check_mentor: !!res.success,
          });
        }
      )
    );
  };

  // Remove File
  removeFile(index) {
    let { editionValue } = this.state;
    const file = editionValue?.files[index];
    const ids_to_remove = editionValue?.ids_to_remove || [];

    if (file && file.id && !ids_to_remove.includes(file.id)) {
      ids_to_remove.push(file.id);
    }

    editionValue?.files.splice(index, 1);
    editionValue = {
      files: editionValue?.files,
      ids_to_remove,
    };
    this.setState({ editionValue });
  }

  renderFiles() {
    const { proposal } = this.state;
    const items = [];
    const files = proposal.files || [];

    files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <a
            href={Helper.joinURL(process.env.NEXT_PUBLIC_BACKEND_URL, file.url)}
            target="_blank"
            rel="noreferrer"
          >
            {file.name}
          </a>
        </li>
      );
    });

    return items;
  }

  renderRawFiles() {
    const { editionValue } = this.state;
    const items = [];

    editionValue?.files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <a
            className="pr-2"
            href={Helper.joinURL(process.env.NEXT_PUBLIC_BACKEND_URL, file.url)}
            target="_blank"
            rel="noreferrer"
          >
            {file.name}
          </a>
          <Icon.X onClick={() => this.removeFile(index)} />
        </li>
      );
    });

    return items;
  }

  // Render Onboarding Section
  renderOnboardingSection() {
    const { authUser, proposal } = this.props;
    if (!authUser.is_admin) return null;

    if (
      proposal.votes &&
      proposal.votes.length &&
      proposal.onboarding &&
      proposal.onboarding.id
    ) {
      const user = proposal.user;
      return (
        <div className="app-simple-section">
          <div className="app-simple-section__title">
            <label>Onboarding Stage</label>
            <Icon.Info size={16} />
          </div>
          <div className="app-simple-section__body">
            <label className="font-weight-700 d-block">KYC Status:</label>
            <p>
              {user.shuftipro && user.shuftipro.status == "approved"
                ? "Pass"
                : user.shuftipro
                ? "Fail"
                : "Need to Submit"}
            </p>
            <label className="font-weight-700 d-block">
              Final Grant Agreement:
            </label>
            <p>
              {proposal.final_document ? (
                <a
                  href={Helper.joinURL(
                    process.env.NEXT_PUBLIC_BACKEND_URL,
                    proposal.final_document
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="dynamic-color"
                >
                  View
                </a>
              ) : null}
            </p>
            {proposal.form_submitted ? (
              <a
                className="dynamic-color"
                style={{ cursor: "pointer" }}
                onClick={this.clickViewForm}
              >
                <u>View Payment Form</u>
              </a>
            ) : null}
          </div>
        </div>
      );
    }
  }

  renderGrants() {
    const { proposal } = this.state;
    const grants = proposal.grants || [];
    const items = [];
    if (grants) {
      //day
      grants.forEach((grant, index) => {
        const percent = +grant.grant / +proposal.total_grant;
        items.push(
          <div className="app-spd-grant-item" key={`grant_${index}`}>
            <Icon.CheckSquare color="#9B64E6" />
            <div>
              <label className="font-weight-700">
                {GRANTTYPES[grant.type]}
              </label>
              <span>
                {["milestones", "total_grant"].includes(
                  this.state.editionField
                ) &&
                  Helper.formatPriceNumber(
                    parseFloat(
                      (percent * this.state.editionValue.total_grant).toFixed(
                        DECIMALS
                      )
                    )
                  )}
                {!["milestones", "total_grant"].includes(
                  this.state.editionField
                ) && Helper.formatPriceNumber(grant.grant)}
              </span>
              <span>{grant.type_other || ""}</span>
              <p
                className="font-size-14"
                style={{ marginTop: "10px", marginBottom: "10px" }}
              >
                Percentage kept by OP: {grant.percentage || 0}%
              </p>
            </div>
          </div>
        );
      });
    }

    return items;
  }

  renderEditGrants() {
    const { grants } = this.state.editionValue;
    const items = [];

    GRANTTYPES.forEach((grant, index) => {
      const key = `grant_${index}`;
      const checked = grants[key] && grants[key].checked ? true : false;
      const value = grants[key] && grants[key].grant ? grants[key].grant : "";
      const type_other =
        grants[key] && grants[key].type_other ? grants[key].type_other : "";
      const percentage =
        grants[key] && grants[key].percentage ? grants[key].percentage : "";

      if (index != GRANTTYPES.length - 1) {
        items.push(
          <div key={`grant_${index}`} className="c-checkbox-item normal">
            <div
              className="c-checkbox-itemSymbol"
              onClick={() => this.toggle(index)}
            >
              {checked ? (
                <Icon.CheckSquare color="#9B64E6" />
              ) : (
                <Icon.Square color="#9B64E6" />
              )}
            </div>
            <div className="c-checkbox-itemContent">
              <label className="d-block" onClick={() => this.toggle(index)}>
                {grant}
              </label>
              <div className="c-checkbox-itemContentInner">
                <input
                  type="text"
                  placeholder="Amount for this item in Euros"
                  onChange={(e) => this.inputAmount(e, index)}
                  value={
                    value ? Helper.formatPriceNumber(value.toString()) : ""
                  }
                />
                <input
                  type="text"
                  value={Helper.formatPercentage(percentage)}
                  placeholder=""
                  className="grant-percentage"
                  onChange={(e) => this.inputPercentage(e, index)}
                />
                <label>Percentage kept by OP</label>
              </div>
            </div>
          </div>
        );
      } else {
        items.push(
          <div key={`grant_${index}`} className="c-checkbox-item other">
            <div
              className="c-checkbox-itemSymbol"
              onClick={() => this.toggle(index)}
              style={{ marginTop: "12px" }}
            >
              {checked ? (
                <Icon.CheckSquare color="#9B64E6" />
              ) : (
                <Icon.Square color="#9B64E6" />
              )}
            </div>
            <div className="c-checkbox-itemContent">
              <div className="c-checkbox-itemOther">
                <label onClick={() => this.toggle(index)}>{grant}</label>
                <input
                  type="text"
                  placeholder="Enter use of funds"
                  value={type_other}
                  onChange={(e) => this.inputOther(e, index)}
                />
              </div>
              <div className="c-checkbox-itemContentInner">
                <input
                  type="text"
                  placeholder="Amount for this item in Euros"
                  onChange={(e) => this.inputAmount(e, index)}
                  value={
                    value ? Helper.formatPriceNumber(value.toString()) : ""
                  }
                />
                <input
                  type="text"
                  value={Helper.formatPercentage(percentage)}
                  className="grant-percentage"
                  onChange={(e) => this.inputPercentage(e, index)}
                />
                <label>Percentage kept by OP</label>
              </div>
            </div>
          </div>
        );
      }
    });

    return items;
  }

  renderCitations() {
    const { proposal } = this.state;
    const citations = proposal.citations || [];
    const items = [];
    if (citations && citations.length) {
      citations.forEach((citation, index) => {
        items.push(
          <div key={`citation_${index}`}>
            <label className="d-block mt-5 mb-5" style={{ color: "#9B64E6" }}>
              Citation #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">{`Cited Proposal Number`}</label>
            <p>{citation.rep_proposal_id}</p>
            <label className="font-weight-700 d-block">{`Cited Proposal Title`}</label>
            <p>{citation.rep_proposal.title}</p>
            <label className="font-weight-700 d-block">{`Cited Proposal OP`}</label>
            <p>{citation.rep_proposal.user.profile.forum_name}</p>
            <label className="font-weight-700 d-block">{`Explain how this work is foundational to your work`}</label>
            <p>{citation.explanation}</p>
            <label className="font-weight-700 d-block">{`% of the rep gained from this proposal do you wish to give to the OP of the prior work`}</label>
            <p>{citation.percentage}</p>
          </div>
        );
      });
    }
    return (
      <>
        {this.renderLabelEdition("Citations", "citations", {
          citations: JSON.parse(
            JSON.stringify(
              proposal.citations.map((x) => ({
                ...x,
                proposalId: x.rep_proposal_id,
              }))
            )
          ),
        })}
        {this.state.editionField !== "citations" && <>{items}</>}
        {this.state.editionField === "citations" && (
          <ProposalCitationView
            showAction={true}
            citations={this.state.editionValue.citations}
            onUpdate={(citations) => {
              this.inputField({
                citations,
              });
            }}
          />
        )}
      </>
    );
  }

  renderMilestones() {
    const { proposal } = this.state;
    const milestones = proposal.milestones || [];
    const items = [];
    if (milestones) {
      // day
      milestones.forEach((milestone, index) => {
        const percent = +milestone.grant / +proposal.total_grant;
        items.push(
          <div key={`milestone_${index}`}>
            <label className="d-block mt-5 mb-5" style={{ color: "#9B64E6" }}>
              Milestone #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">
              Title of Milestone (10 word limit)
            </label>
            <p>{milestone.title}</p>
            <label className="font-weight-700 d-block">
              Details of what will be delivered in milestone
            </label>
            <p className="text-pre-wrap">{milestone.details}</p>
            <label className="font-weight-700 d-block">
              {`Acceptance criteria: Please enter the specific details on what
                the deliverable must do to prove this milestone is complete.`}
            </label>
            <p className="text-pre-wrap">{milestone.criteria}</p>
            {/* {milestone.kpi && (
              <>
                <label className="font-weight-700 d-block">
                  {`Please detail the KPIs (Key Performance Indicators) for each milestone and your project overall. Please provide as many details as possible. Any KPIs should measure your delivery's performance.`}
                </label>
                <p>{milestone.kpi}</p>
              </>
            )} */}
            <label className="font-weight-700 d-block">
              Grant portion requested for this milestone
            </label>
            {/* <p>{Helper.formatPriceNumber(milestone.grant.toString())}</p> */}
            <p>
              {["grants", "total_grant"].includes(this.state.editionField) &&
                Helper.formatPriceNumber(
                  parseFloat(
                    (percent * this.state.editionValue.total_grant).toFixed(
                      DECIMALS
                    )
                  )
                )}
              {!["grants", "total_grant"].includes(this.state.editionField) &&
                Helper.formatPriceNumber(milestone.grant)}
            </p>
            <label className="font-weight-700 d-block">Deadline</label>
            <p>
              {milestone.deadline
                ? moment(milestone.deadline).format("M/D/YYYY")
                : ""}
            </p>
            <label className="font-weight-700 d-block">
              Level of Difficulty
            </label>
            <p>{milestone.level_difficulty}</p>
          </div>
        );
      });
    }
    return items;
  }

  renderMembers() {
    const { proposal } = this.state;
    const members = proposal.members || [];
    const items = [];

    if (members) {
      members.forEach((member, index) => {
        items.push(
          <div key={`member_${index}`}>
            <label className="d-block mt-5 mb-5" style={{ color: "#9B64E6" }}>
              Team Member #{index + 1}:
            </label>
            <label className="font-weight-700 d-block">Full Name</label>
            <p>{member.full_name}</p>
            <label className="font-weight-700 d-block">
              Education/Experience
            </label>
            <p className="text-pre-wrap">{member.bio}</p>
          </div>
        );
      });
    }

    return items;
  }

  renderStatus(proposalParams = null) {
    let proposal;
    if (proposalParams) {
      proposal = proposalParams;
    } else {
      proposal = this.state.proposal;
    }
    if (proposal.status == "pending") return "Pending";
    else if (proposal.status == "payment") {
      if (proposal.dos_paid) return "Payment Clearing";
      else return "Payment Waiting";
    } else if (proposal.status == "denied") return "Denied";
    else if (proposal.status == "completed") return "Completed";
    else if (proposal.status == "approved") {
      if (proposal.votes && proposal.votes.length) {
        if (proposal.votes.length > 1) {
          // Formal Vote
          const formalVote = proposal.votes[1];
          if (formalVote.status == "active") return "Formal Voting Live";
          else {
            // Formal Vote Result
            if (formalVote.result == "success") return "Formal Voting Passed";
            else if (formalVote.result == "no-quorum")
              return "Formal Voting No Quorum";
            else return "Formal Voting Failed";
          }
        } else {
          // Informal Vote
          const informalVote = proposal.votes[0];
          if (informalVote.status == "active") return "Informal Voting Live";
          else {
            // Informal Vote Result
            if (informalVote.result == "success")
              return "Informal Voting Passed";
            else if (informalVote.result == "no-quorum")
              return "Informal Voting No Quorum";
            else return "Informal Voting Failed";
          }
        }
      } else return "In Discussion";
    }
    return "";
  }

  clickWithdraw(e) {
    e.preventDefault();
    this.props.dispatch(
      setCustomModalData({
        "confirm-discussion-withdraw": {
          render: true,
          title: "Are you sure? This is final.",
          data: this.state.proposal,
        },
      })
    );
    this.props.dispatch(setActiveModal("custom-global-modal"));
  }

  calcOwed(proposal) {
    const milestoneIds = proposal.milestones.map((x) => x.id);
    const milestoneIdsPassedFormalVote = proposal.votes
      .filter(
        (x) =>
          milestoneIds.includes(x.milestone_id) &&
          x.type === "formal" &&
          x.status === "completed"
      )
      .map((x) => x.milestone_id);
    const total = milestoneIdsPassedFormalVote.reduce((sum, x) => {
      const mile = proposal.milestones.find((y) => +y.id === +x);
      return sum + mile.grant;
    }, 0);
    const advanceAmount = +proposal.proposal_request_from?.total_grant || 0;
    return advanceAmount - total > 0 ? advanceAmount - total : 0;
  }

  renderCoreInfo() {
    const { proposal } = this.state;
    const surveyWon = proposal?.winner;
    const surveyLose = proposal?.loser;

    return (
      <ul>
        <li>
          {proposal.status == "approved" &&
            proposal.votes &&
            !!proposal.votes.length &&
            !!proposal.pdf && (
              <a
                href={Helper.joinURL(
                  process.env.NEXT_PUBLIC_BACKEND_URL,
                  proposal.pdf
                )}
                target="_blank"
                rel="noreferrer"
                className="pdf-link mb-2"
              >
                View as PDF
              </a>
            )}
        </li>
        <li>
          <label>Proposal Number:</label>
          <span>{proposal.id}</span>
        </li>
        <li>
          <label>Proposal Type:</label>
          <span className="text-capitalize">
            {PROPOSAL_TYPES[proposal.type]}
          </span>
        </li>
        <li>
          <label>OP:</label>
          <Link to={`/app/user/${proposal?.user?.id}`}>
            <span>
              {proposal.user && proposal.user.profile
                ? proposal.user.profile.forum_name
                : ""}
            </span>
          </Link>
        </li>
        {proposal.sponsor && proposal.sponsor.id ? (
          <li>
            <label>Sponsor:</label>
            <span>{proposal.sponsor.profile.forum_name}</span>
          </li>
        ) : null}
        <li>
          <label>Rep Staked:</label>
          <span>{proposal.rep ? proposal.rep : ""}</span>
        </li>
        <li>
          <label>Proposal Status:</label>
          <span>{this.renderStatus()}</span>
        </li>
        {surveyWon && (
          <>
            <li>
              <label>Survey won:</label>
              <span>{surveyWon ? `S${surveyWon?.survey_id}` : "-"}</span>
            </li>
            <li>
              <label>Survey rank:</label>
              <span>
                {surveyWon
                  ? `${surveyWon?.rank}/${surveyWon?.survey?.number_response}`
                  : "-"}
              </span>
            </li>
          </>
        )}
        {surveyLose && (
          <>
            <li>
              <label>Survey Lost:</label>
              <span>{surveyLose ? `S${surveyLose?.survey_id}` : "-"}</span>
            </li>
            <li>
              <label>Downvote rank:</label>
              <span>
                {surveyLose
                  ? `${surveyLose?.rank}/${surveyLose?.survey?.number_response}`
                  : "-"}
              </span>
            </li>
          </>
        )}
        {proposal.type === "grant" && (
          <li>
            <label>Advance payment requested:</label>
            <span>{proposal.proposal_request_from ? "Yes" : "No"}</span>
          </li>
        )}
        {proposal.proposal_request_from && (
          <>
            <li>
              <label>Advance amount requested:</label>
              <span>
                {Helper.formatPriceNumber(
                  proposal?.proposal_request_from?.total_grant || 0,
                  "€"
                )}
              </span>
            </li>
            <li>
              <label>Advance amount request link:</label>
              <span>
                <Link
                  to={`/app/proposal/${proposal.proposal_request_from?.id}`}
                >
                  #{proposal.proposal_request_from?.id}
                </Link>
              </span>
            </li>
            <li>
              <label>Advance status:</label>
              <span>{this.renderStatus(proposal.proposal_request_from)}</span>
            </li>
            <li>
              <label>Advance amount owed:</label>
              <span>
                {Helper.formatPriceNumber(this.calcOwed(proposal) || 0, "€")}
              </span>
            </li>
          </>
        )}
      </ul>
    );
  }

  renderTags() {
    const { proposal } = this.state;
    const items = [];

    if (proposal && proposal.tags) {
      const tags = proposal.tags.split(",");
      for (let i in tags) {
        items.push(
          <li
            className="btn btn-primary extra-small btn-fluid-small btn-round"
            key={`key${i}`}
          >
            {tags[i]}
          </li>
        );
      }
    }

    return <ul>{items}</ul>;
  }

  renderLabelEdition = (title, field, initialValue, showInfoIcon = false) => {
    return (
      <label className="font-weight-700 d-block">
        <span className="pr-20">{title}</span>
        {showInfoIcon && (
          <span className="pr-20">
            <Icon.Info size={16} />
          </span>
        )}
        {this.state.editionMode && (
          <Icon.Edit
            onClick={() => this.editField(field, initialValue)}
            style={{ cursor: "pointer" }}
            size={20}
            color="#7137ce"
          />
        )}
      </label>
    );
  };

  getProposalTotalGrant = () => {
    const { proposal, editionField, editionValue } = this.state;
    if (editionField === "milestones") {
      return editionValue.total_grant;
    }
    return proposal.total_grant;
  };

  renderLicenseDropdown() {
    const { editionValue } = this.state;
    const items = [];

    LICENSES.forEach((item, index) => {
      items.push(
        <option key={`option_${index}`} value={item.key}>
          {item.title}
        </option>
      );
    });

    return (
      <>
        <div className="row">
          <div className="col-md-4">
            <select
              value={editionValue.license}
              onChange={(e) =>
                this.inputField({
                  license: e.target.value,
                  license_other: null,
                })
              }
              required
            >
              <option value="">Select...</option>
              {items}
            </select>
            {/* {license == -1 ? (
              <p className="text-danger font-size-14 mt-2">
                You must select a license type
              </p>
            ) : null} */}
          </div>
          {+editionValue.license == 5 && (
            <div className="col-md-4">
              <input
                value={editionValue.license_other || ""}
                type="text"
                placeholder="Enter License"
                onChange={(e) =>
                  this.inputField({
                    license: editionValue.license,
                    license_other: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>
      </>
    );
  }

  openAdminTools = () => {
    const { proposal } = this.state;
    this.props.dispatch(
      setActiveModal("admin-tools", { proposalId: proposal.id })
    );
  };

  renderContent() {
    const { proposal, expanded } = this.state;
    const { isAutoExpand } = this.props;

    return (
      <Fragment>
        <div>
          <Card isAutoExpand={isAutoExpand} extraAction={this.toggle}>
            <CardHeader>
              <>
                {!expanded && (
                  <div
                    className="app-simple-section__titleInner w-100"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <label>Current Proposal Details</label>
                      <Icon.Info size={16} />
                    </div>
                    <CardContext.Consumer>
                      {(value) =>
                        value.isExpand && (
                          <>
                            {proposal.status === "approved" &&
                              !proposal.votes.length &&
                              this.props.authUser.id === proposal.user.id &&
                              this.props.allowEdit && (
                                <div className="d-flex flex-column align-items-center  mr-30">
                                  <button
                                    className="btn btn-primary btn-fluid small"
                                    onClick={this.toggleEditMode}
                                  >
                                    Edit Proposal
                                  </button>
                                  <a
                                    className="pt-2 font-weight-500 text-underline "
                                    style={{
                                      color: "inherit",
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => this.clickWithdraw(e)}
                                  >
                                    Withdraw Proposal
                                  </a>
                                </div>
                              )}
                            {proposal.status === "approved" &&
                              !proposal.votes.length &&
                              !!this.props.authUser.is_admin &&
                              this.props.allowEdit && (
                                <div className="d-flex flex-column align-items-center  mr-30">
                                  <button
                                    className="btn btn-primary btn-fluid small"
                                    onClick={this.openAdminTools}
                                  >
                                    Admin Tools
                                  </button>
                                </div>
                              )}
                          </>
                        )
                      }
                    </CardContext.Consumer>
                  </div>
                )}
                {!!expanded && (
                  <div
                    className="app-simple-section__titleInner"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <label>General Project Details</label>
                      <Icon.Info size={16} />
                    </div>
                    {proposal.status === "approved" &&
                      !proposal.votes.length &&
                      this.props.authUser.id === proposal.user.id &&
                      this.props.allowEdit && (
                        <div className="d-flex flex-column align-items-center  mr-30">
                          <button
                            className="btn btn-primary btn-fluid small"
                            onClick={this.toggleEditMode}
                            disabled={!this.state.allowSave}
                          >
                            {!this.state.editionMode
                              ? "Edit Proposal"
                              : "Save Changes"}
                          </button>
                          <a
                            className="pt-2 font-weight-500 text-underline"
                            style={{ color: "inherit", cursor: "pointer" }}
                            onClick={(e) => this.clickWithdraw(e)}
                          >
                            Withdraw Proposal
                          </a>
                        </div>
                      )}
                    {proposal.status === "approved" &&
                      !proposal.votes.length &&
                      !!this.props.authUser.is_admin &&
                      this.props.allowEdit && (
                        <div className="d-flex flex-column align-items-center  mr-30">
                          {this.state.editionMode ? (
                            <button
                              className="btn btn-primary btn-fluid small"
                              onClick={this.toggleEditMode}
                              disabled={!this.state.allowSave}
                            >
                              Save Changes
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-fluid small"
                              onClick={this.openAdminTools}
                            >
                              Admin Tools
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </>
            </CardHeader>
            <CardPreview>
              <div className="app-simple-section__title with-children">
                {this.renderCoreInfo()}
              </div>
              {!expanded && (
                <div className="app-simple-section__body">
                  <label className="font-weight-700 d-block">
                    Title of proposed Project (limit 10 words)
                  </label>
                  <p>{proposal.title}</p>
                  {["grant", "simple"].includes(proposal.type) && (
                    <>
                      <label className="font-weight-700 d-block">
                        {`Describe your project in detail. Please include what it does
                        and what problem it solves`}
                      </label>
                      <p className="text-pre-wrap">
                        {proposal.short_description}
                        {this.checkProposalChange("short_description")}
                      </p>
                    </>
                  )}
                  {["advance-payment"].includes(proposal.type) && (
                    <>
                      <label className="font-weight-700 d-block">
                        {`Select the proposal you are requesting a payment advance for`}
                      </label>
                      <p className="text-pre-wrap">
                        <Link
                          to={`/app/proposal/${proposal.proposal_request_payment?.id}`}
                        >
                          #{proposal.proposal_request_payment?.id}
                        </Link>
                      </p>
                      <label className="font-weight-700 d-block">
                        {`The portion of this proposal you are requesting as an advance`}
                      </label>
                      <p className="text-pre-wrap">
                        {Helper.formatPriceNumber(
                          proposal.total_grant || 0,
                          "€"
                        )}
                      </p>
                      <label className="font-weight-700 d-block">
                        {`Why are you requesting this amount as an advance`}
                      </label>
                      <p className="text-pre-wrap">
                        {proposal.amount_advance_detail}
                      </p>
                    </>
                  )}
                  {["admin-grant"].includes(proposal.type) && (
                    <>
                      <label className="font-weight-700 d-block">
                        {`Euro amount requested`}
                      </label>
                      <p className="text-pre-wrap">
                        {Helper.formatPriceNumber(
                          proposal.total_grant || "",
                          "€"
                        )}
                      </p>
                      <label className="font-weight-700 d-block">
                        {`Enter what is being delivered for the DxD/ETA`}
                      </label>
                      <p className="text-pre-wrap">
                        {proposal.things_delivered}
                      </p>
                      <label className="font-weight-700 d-block">
                        {`When will this be delivered`}
                      </label>
                      <p className="text-pre-wrap">
                        {moment(proposal.delivered_at)
                          .local()
                          .format("DD/MM/YYYY")}
                      </p>
                      <label className="font-weight-700 d-block">
                        {`Other notes`}
                      </label>
                      <p className="text-pre-wrap">{proposal.extra_notes}</p>
                    </>
                  )}
                  {proposal.type == "grant" ? (
                    <Fragment>
                      <label className="font-weight-700 d-block">
                        Please enter the total amount you are requesting as a
                        grant:
                      </label>
                      <p>
                        {Helper.formatPriceNumber(proposal.total_grant)}
                        {this.checkProposalChange("total_grant")}
                      </p>
                    </Fragment>
                  ) : null}
                  <label className="font-weight-700 d-block">
                    Uploaded Files
                  </label>
                  <ul id="app-spd-fileList" className="mt-3 mb-4">
                    {this.renderFiles()}
                  </ul>
                </div>
              )}
            </CardPreview>
            <CardBody>
              <>
                <div className="app-simple-section__title with-children">
                  {this.renderCoreInfo()}
                </div>
                {!expanded && (
                  <div className="app-simple-section__body">
                    <label className="font-weight-700 d-block">
                      Title of proposed Project (limit 10 words)
                    </label>
                    <p>{proposal.title}</p>
                    <label className="font-weight-700 d-block">
                      Describe your project in detail. Please include what it
                      does and what problem it solves
                    </label>
                    <p className="text-pre-wrap">
                      {proposal.short_description}
                      {this.checkProposalChange("short_description")}
                    </p>
                    {proposal.type == "grant" ? (
                      <Fragment>
                        <label className="font-weight-700 d-block">
                          Please enter the total amount you are requesting as a
                          grant:
                        </label>
                        <p>
                          {Helper.formatPriceNumber(proposal.total_grant)}
                          {this.checkProposalChange("total_grant")}
                        </p>
                      </Fragment>
                    ) : null}
                    <label className="font-weight-700 d-block">
                      Uploaded Files
                    </label>
                    <ul id="app-spd-fileList" className="mt-3 mb-4">
                      {this.renderFiles()}
                    </ul>
                  </div>
                )}
                {!!expanded && (
                  <div className="app-simple-section__body">
                    {["advance-payment"].includes(proposal.type) && (
                      <>
                        <label className="font-weight-700 d-block">
                          {`Select the proposal you are requesting a payment advance for`}
                        </label>
                        <p className="text-pre-wrap">
                          #{proposal.proposal_request_payment?.id}
                        </p>
                        <label className="font-weight-700 d-block">
                          {`The portion of this proposal you are requesting as an advance`}
                        </label>
                        <p className="text-pre-wrap">
                          {Helper.formatPriceNumber(
                            proposal.total_grant || 0,
                            "€"
                          )}
                        </p>
                        <label className="font-weight-700 d-block">
                          {`Why are you requesting this amount as an advance`}
                        </label>
                        <p className="text-pre-wrap">
                          {proposal.amount_advance_detail}
                        </p>
                        <label className="font-weight-700 d-block">
                          Uploaded Files
                        </label>
                        <ul id="app-spd-fileList" className="mt-3 mb-4">
                          {this.renderFiles()}
                        </ul>
                      </>
                    )}
                    {["admin-grant"].includes(proposal.type) && (
                      <>
                        <>
                          <label className="font-weight-700 d-block">
                            Title of proposed Project (limit 10 words)
                          </label>
                          <p className="text-pre-wrap">{proposal.title}</p>
                        </>
                        <>
                          {this.renderLabelEdition(
                            "Euro amount requested",
                            "total_grant",
                            proposal.total_grant
                          )}
                          {this.state.editionField !== "total_grant" && (
                            <p className="text-pre-wrap">
                              {proposal.total_grant}
                              {this.checkProposalChange("total_grant")}
                            </p>
                          )}
                          {this.state.editionField === "total_grant" && (
                            <div className="c-form-row">
                              <input
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                type="number"
                                required
                              />
                            </div>
                          )}
                        </>
                        <>
                          {this.renderLabelEdition(
                            "Enter what is being delivered for the DxD/ETA",
                            "things_delivered",
                            proposal.things_delivered
                          )}
                          {this.state.editionField !== "things_delivered" && (
                            <p className="text-pre-wrap">
                              {proposal.things_delivered}
                              {this.checkProposalChange("things_delivered")}
                            </p>
                          )}
                          {this.state.editionField === "things_delivered" && (
                            <div className="c-form-row">
                              <textarea
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                required
                              ></textarea>
                            </div>
                          )}
                        </>
                        <>
                          {this.renderLabelEdition(
                            "When will this be delivered",
                            "delivered_at",
                            proposal.delivered_at
                          )}
                          {this.state.editionField !== "delivered_at" && (
                            <p className="text-pre-wrap">
                              {moment(proposal.delivered_at)
                                .local()
                                .format("DD/MM/YYYY")}
                              {this.checkProposalChange("delivered_at")}
                            </p>
                          )}
                          {this.state.editionField === "delivered_at" && (
                            <div className="c-form-row">
                              <BasicDatePicker
                                value={
                                  this.state.editionValue
                                    ? moment(this.state.editionValue).local()
                                    : null
                                }
                                onChange={(e) => this.inputField(e)}
                              />
                            </div>
                          )}
                        </>
                        <>
                          {this.renderLabelEdition(
                            "Other notes",
                            "extra_notes",
                            proposal.extra_notes
                          )}
                          {this.state.editionField !== "extra_notes" && (
                            <p className="text-pre-wrap">
                              {proposal.extra_notes}
                              {this.checkProposalChange("extra_notes")}
                            </p>
                          )}
                          {this.state.editionField === "extra_notes" && (
                            <div className="c-form-row">
                              <textarea
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                required
                              ></textarea>
                            </div>
                          )}
                        </>
                        <>
                          <label className="font-weight-700 d-block">
                            Uploaded Files
                          </label>
                          <ul id="app-spd-fileList" className="mt-3 mb-4">
                            {this.renderFiles()}
                          </ul>
                        </>
                      </>
                    )}
                    {["grant", "simple"].includes(proposal.type) && (
                      <>
                        <>
                          {this.renderLabelEdition(
                            "Title of proposed Project (limit 10 words)",
                            "title",
                            proposal.title
                          )}
                          {this.state.editionField !== "title" && (
                            <p>{proposal.title}</p>
                          )}
                          {this.state.editionField === "title" && (
                            <div className="c-form-row">
                              <input
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                type="text"
                                required
                              />
                            </div>
                          )}
                        </>
                        {this.renderLabelEdition(
                          "Describe your project in detail. Please include what it does and what problem it solves",
                          "short_description",
                          proposal.short_description
                        )}
                        {this.state.editionField !== "short_description" && (
                          <p className="text-pre-wrap">
                            {proposal.short_description}
                            {this.checkProposalChange("short_description")}
                          </p>
                        )}
                        {this.state.editionField === "short_description" && (
                          <div className="c-form-row">
                            <textarea
                              value={this.state.editionValue}
                              onChange={(e) => this.inputField(e)}
                              required
                            ></textarea>
                          </div>
                        )}
                      </>
                    )}
                    {proposal.type === "simple" && (
                      <>
                        <label className="font-weight-700 d-block">
                          Uploaded Files
                        </label>
                        <ul id="app-spd-fileList" className="mt-3 mb-4">
                          {this.renderFiles()}
                        </ul>
                      </>
                    )}
                    {proposal.type === "grant" && (
                      <>
                        <>
                          {this.renderLabelEdition(
                            "Explanation as to how your proposed project would benefit the DEVxDAO ecosystem AND/OR support transparent and open source scientific research and/ or development if applicable.",
                            "explanation_benefit",
                            proposal.explanation_benefit
                          )}
                          {this.state.editionField !==
                            "explanation_benefit" && (
                            <p className="text-pre-wrap">
                              {proposal.explanation_benefit}
                            </p>
                          )}
                          {this.state.editionField ===
                            "explanation_benefit" && (
                            <div className="c-form-row">
                              <textarea
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                required
                              ></textarea>
                            </div>
                          )}
                        </>
                        {/* <>
                          {this.renderLabelEdition(
                            "Explanation as to how your proposed Project will achieve ETA's mission of transparent and open source scientific research and/ or development if applicable.",
                            "explanation_goal",
                            proposal.explanation_goal
                          )}
                          {this.state.editionField !== "explanation_goal" && (
                            <p>{proposal.explanation_goal}</p>
                          )}
                          {this.state.editionField === "explanation_goal" && (
                            <div className="c-form-row">
                              <textarea
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                required
                              ></textarea>
                            </div>
                          )}
                        </> */}
                        <>
                          {this.renderLabelEdition(
                            "Under which open source license(s) will you publish any research and development associated with your proposed Project? All research papers or the like should be Creative Commons.",
                            "license",
                            {
                              license: proposal.license,
                              license_other: proposal.license_other,
                            }
                          )}
                          {this.state.editionField !== "license" && (
                            <p>{this.renderLicense()}</p>
                          )}
                          {this.state.editionField === "license" && (
                            <div className="c-form-row">
                              {this.renderLicenseDropdown()}
                            </div>
                          )}
                        </>
                        <>
                          {this.renderLabelEdition(
                            "Your resume (Linkedin) or Git (For developers)",
                            "resume",
                            proposal.resume
                          )}
                          {this.state.editionField !== "resume" && (
                            <p>{proposal.resume}</p>
                          )}
                          {this.state.editionField === "resume" && (
                            <div className="c-form-row">
                              <input
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                type="text"
                                required
                              />
                            </div>
                          )}
                        </>
                        <>
                          {this.renderLabelEdition(
                            "Notes or reference about the project, such as similar projects or web pages about APIs to be integrated with your build",
                            "extra_notes",
                            proposal.extra_notes
                          )}
                          {this.state.editionField !== "extra_notes" && (
                            <p className="text-pre-wrap">
                              {proposal.extra_notes}
                            </p>
                          )}
                          {this.state.editionField === "extra_notes" && (
                            <div className="c-form-row">
                              <textarea
                                value={this.state.editionValue}
                                onChange={(e) => this.inputField(e)}
                                required
                              ></textarea>
                            </div>
                          )}
                        </>
                      </>
                    )}
                  </div>
                )}
              </>
            </CardBody>
          </Card>
        </div>
        {!!expanded && proposal.type === "grant" && (
          <>
            <div className="app-simple-section">
              <div className="app-simple-section__title">
                {this.renderLabelEdition(
                  "Team Details",
                  "members",
                  {
                    members: proposal.member_required
                      ? JSON.parse(JSON.stringify(proposal.members))
                      : [
                          {
                            full_name: "",
                            bio: "",
                            address: "",
                            city: "",
                            zip: "",
                            country: "",
                          },
                        ],
                    memberChecked: true,
                    memberRequired: !!proposal.member_required,
                  },
                  true
                )}
              </div>
              <div className="app-simple-section__body">
                {this.state.editionField !== "members" && (
                  <>
                    {!!proposal.member_required && <>{this.renderMembers()}</>}
                    {!proposal.member_required && (
                      <p>I am working on this project alone.</p>
                    )}
                  </>
                )}
                {this.state.editionField === "members" && (
                  <>
                    <div className="c-checkbox-item">
                      <div
                        className="c-checkbox-itemSymbol"
                        onClick={() => {
                          this.inputField({
                            ...this.state.editionValue,
                            memberRequired: false,
                          });
                        }}
                      >
                        {!this.state.editionValue.memberRequired ? (
                          <Icon.CheckSquare color="#9B64E6" />
                        ) : (
                          <Icon.Square color="#9B64E6" />
                        )}
                      </div>
                      <label
                        className="font-size-14"
                        onClick={() => {
                          this.inputField({
                            ...this.state.editionValue,
                            memberRequired: false,
                          });
                        }}
                      >
                        {"I am working on this project alone."}
                      </label>
                    </div>
                    <div className="c-checkbox-item">
                      <div
                        className="c-checkbox-itemSymbol"
                        onClick={() => {
                          this.inputField({
                            ...this.state.editionValue,
                            memberRequired: true,
                          });
                        }}
                      >
                        {this.state.editionValue.memberRequired ? (
                          <Icon.CheckSquare color="#9B64E6" />
                        ) : (
                          <Icon.Square color="#9B64E6" />
                        )}
                      </div>
                      <label
                        className="font-size-14"
                        onClick={() => {
                          this.inputField({
                            ...this.state.editionValue,
                            memberRequired: true,
                          });
                        }}
                      >
                        {
                          "I have a team of at least one of person (you will need to provide information for team members)."
                        }
                      </label>
                    </div>
                    {this.state.editionValue.memberRequired && (
                      <ProposalTeamView
                        allowDeleteItem
                        members={this.state.editionValue.members}
                        onUpdate={(members) => {
                          this.inputField({
                            members,
                            memberRequired: true,
                            memberChecked: this.state.editionValue
                              .memberChecked,
                          });
                        }}
                        memberChecked={this.state.editionValue.memberChecked}
                        onUpdateChecked={(memberChecked) => {
                          this.inputField({
                            members: this.state.editionValue.members,
                            memberRequired: true,
                            memberChecked,
                          });
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="app-simple-section">
              <div className="app-simple-section__title">
                <label>Grant Details</label>
                <Icon.Info size={16} />
              </div>
              <div className="app-simple-section__body">
                <>
                  {this.renderLabelEdition(
                    "Please enter the total amount you are requesting as a grant:",
                    "total_grant",
                    {
                      total_grant: proposal.total_grant,
                    }
                  )}
                  {this.state.editionField !== "total_grant" && (
                    <p>
                      {this.state.editionValue.total_grant
                        ? Helper.formatPriceNumber(
                            this.state.editionValue.total_grant
                          )
                        : Helper.formatPriceNumber(proposal.total_grant)}
                      {this.checkProposalChange("total_grant")}
                    </p>
                  )}
                  {this.state.editionField === "total_grant" && (
                    <div className="c-form-row">
                      <input
                        type="text"
                        value={this.state.editionValue.total_grant}
                        placeholder="Total in Euros"
                        onChange={(e) => {
                          this.inputField({
                            total_grant: e.target.value,
                          });
                        }}
                      />
                    </div>
                  )}
                </>
                <>
                  {this.renderLabelEdition(
                    "Will payments for this work be made to a entity such as your company or organization instead of to you personally?",
                    "is_company_or_organization",
                    {
                      is_company_or_organization:
                        proposal.is_company_or_organization,
                      name_entity: proposal.name_entity,
                      entity_country: proposal.entity_country,
                    }
                  )}
                  {this.state.editionField !== "is_company_or_organization" && (
                    <p>
                      {proposal.is_company_or_organization
                        ? `Yes (${proposal.name_entity} - ${proposal.entity_country})`
                        : "No"}
                    </p>
                  )}
                  {this.state.editionField === "is_company_or_organization" && (
                    <>
                      <div className="c-form-row">
                        <div className="c-simple-checkbox-item-group">
                          <div className="c-simple-checkbox-item">
                            <div
                              className="c-simple-checkbox-itemSymbol"
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  is_company_or_organization: 0,
                                  name_entity: "",
                                  entity_country: "",
                                })
                              }
                            >
                              {this.state.editionValue
                                .is_company_or_organization ? (
                                <Icon.Square color="#9B64E6" />
                              ) : (
                                <Icon.CheckSquare color="#9B64E6" />
                              )}
                            </div>
                            <label
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  is_company_or_organization: 0,
                                  name_entity: "",
                                  entity_country: "",
                                })
                              }
                            >{`No`}</label>
                          </div>
                          <div className="c-simple-checkbox-item">
                            <div
                              className="c-simple-checkbox-itemSymbol"
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  is_company_or_organization: 1,
                                  name_entity: proposal.name_entity,
                                  entity_country: proposal.entity_country,
                                })
                              }
                            >
                              {this.state.editionValue
                                .is_company_or_organization ? (
                                <Icon.CheckSquare color="#9B64E6" />
                              ) : (
                                <Icon.Square color="#9B64E6" />
                              )}
                            </div>
                            <label
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  is_company_or_organization: 1,
                                  name_entity: proposal.name_entity,
                                  entity_country: proposal.entity_country,
                                })
                              }
                            >{`Yes`}</label>
                          </div>
                        </div>
                      </div>
                      <div className="c-form-row">
                        {!!this.state.editionValue
                          .is_company_or_organization && (
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <div className="c-form-row">
                                <label>What is the name of the entity?</label>
                                <input
                                  value={this.state.editionValue.name_entity}
                                  type="text"
                                  placeholder="Enter name of entity"
                                  onChange={(e) =>
                                    this.inputField({
                                      ...this.state.editionValue,
                                      name_entity: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="c-form-row c-select">
                                <label>
                                  Please select the entity country of
                                  registration.
                                </label>
                                <FormSelectComponent
                                  required
                                  placeholder="Please select a country"
                                  options={COUNTRYLIST}
                                  value={this.state.editionValue.entity_country}
                                  onChange={(e) =>
                                    this.inputField({
                                      ...this.state.editionValue,
                                      entity_country: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
                <>
                  {this.renderLabelEdition(
                    "Please select all planned uses for your grant funds. Select all that apply and enter the estimated portion of grant funds allocated for each. All totals must equal the upper amount",
                    "grants",
                    {
                      grants: proposal.grants.reduce((sum, x) => {
                        sum[`grant_${x.type}`] = {
                          checked: true,
                          grant: x.grant,
                          percentage: x.percentage,
                          type: x.type,
                        };
                        if (x.type_other)
                          sum[`grant_${x.type}`].type_other = x.type_other;
                        return sum;
                      }, {}),
                      total_grant: proposal.total_grant,
                    }
                  )}
                  {this.state.editionField !== "grants" && (
                    <p>{this.renderGrants()}</p>
                  )}
                  {this.state.editionField === "grants" && (
                    <ProposalGrantView
                      hideLabel
                      total_grant={this.state.editionValue.total_grant}
                      grants={this.state.editionValue?.grants}
                      onUpdate={(grants) => {
                        this.inputField({
                          total_grant: proposal.total_grant,
                          grants: { ...grants },
                        });
                      }}
                    />
                  )}
                </>
                <div className="pt-4">
                  {this.renderLabelEdition(
                    "Did a Voting Associate of the DEVxDAO assist you during the grant application process as a mentor?",
                    "have_mentor",
                    {
                      have_mentor: proposal.have_mentor,
                      name_mentor: proposal.name_mentor,
                      total_hours_mentor: proposal.total_hours_mentor,
                      check_mentor: true,
                    }
                  )}
                  {this.state.editionField !== "have_mentor" && (
                    <p>
                      {proposal.have_mentor
                        ? `Yes (${proposal.name_mentor} - ${proposal.total_hours_mentor})`
                        : "No"}
                    </p>
                  )}
                  {this.state.editionField === "have_mentor" && (
                    <>
                      <div className="c-form-row">
                        <div className="c-simple-checkbox-item-group">
                          <div className="c-simple-checkbox-item">
                            <div
                              className="c-simple-checkbox-itemSymbol"
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  have_mentor: 0,
                                  name_mentor: "",
                                  total_hours_mentor: "",
                                })
                              }
                            >
                              {this.state.editionValue.have_mentor ? (
                                <Icon.Square color="#9B64E6" />
                              ) : (
                                <Icon.CheckSquare color="#9B64E6" />
                              )}
                            </div>
                            <label
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  have_mentor: 0,
                                  name_mentor: "",
                                  total_hours_mentor: "",
                                })
                              }
                            >{`No`}</label>
                          </div>
                          <div className="c-simple-checkbox-item">
                            <div
                              className="c-simple-checkbox-itemSymbol"
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  have_mentor: 1,
                                  name_mentor: proposal.name_mentor,
                                  total_hours_mentor:
                                    proposal.total_hours_mentor,
                                })
                              }
                            >
                              {this.state.editionValue.have_mentor ? (
                                <Icon.CheckSquare color="#9B64E6" />
                              ) : (
                                <Icon.Square color="#9B64E6" />
                              )}
                            </div>
                            <label
                              onClick={() =>
                                this.inputField({
                                  ...this.state.editionValue,
                                  have_mentor: 1,
                                  name_mentor: proposal.name_mentor,
                                  total_hours_mentor:
                                    proposal.total_hours_mentor,
                                })
                              }
                            >{`Yes`}</label>
                          </div>
                        </div>
                      </div>
                      <div className="c-form-row">
                        {!!this.state.editionValue.have_mentor && (
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <div className="c-form-row">
                                <label>
                                  Please enter the email or handle of the member
                                  <span className="pl-1">
                                    {this.state.editionValue.check_mentor && (
                                      <Icon.CheckCircle color="#33C333" />
                                    )}
                                    {!this.state.editionValue.check_mentor && (
                                      <Icon.XCircle color="#EA5454" />
                                    )}
                                  </span>
                                </label>
                                <div className="d-flex">
                                  <input
                                    value={this.state.editionValue.name_mentor}
                                    type="text"
                                    onChange={(e) =>
                                      this.inputField({
                                        ...this.state.editionValue,
                                        name_mentor: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                  <button
                                    style={{ height: "auto", padding: 0 }}
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
                              <div className="c-form-row c-select">
                                <label>
                                  How many hours did the mentor help you
                                  (approximately)?
                                </label>
                                <input
                                  value={
                                    this.state.editionValue.total_hours_mentor
                                  }
                                  type="number"
                                  onChange={(e) =>
                                    this.inputField({
                                      ...this.state.editionValue,
                                      total_hours_mentor: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="app-simple-section">
              <div className="app-simple-section__title">
                {this.renderLabelEdition(
                  "Milestone Details",
                  "milestones",
                  {
                    milestones: JSON.parse(JSON.stringify(proposal.milestones)),
                    total_grant: proposal.total_grant,
                  },
                  true
                )}
              </div>
              <div className="app-simple-section__body">
                {this.state.editionField !== "milestones" && (
                  <>
                    <label className="font-weight-700 d-block">
                      {`Projects are typically divided into milestones. Please propose the milestones in which the total project will be delivered:`}
                    </label>
                    {this.renderMilestones()}
                  </>
                )}
                {this.state.editionField === "milestones" && (
                  <ProposalMilestoneView
                    showAction
                    total_grant={this.state.editionValue.total_grant}
                    milestones={this.state.editionValue.milestones}
                    onUpdate={(milestones) => {
                      const sumGrant = milestones.reduce(
                        (sum, x) => sum + +x.grant,
                        0
                      );
                      this.inputField({
                        milestones,
                        total_grant: sumGrant,
                      });
                    }}
                  />
                )}
              </div>
            </div>

            <div className="app-simple-section">
              <div className="app-simple-section__title">
                <label>Relationships and previous work</label>
                <Icon.Info size={16} />
              </div>
              <div className="app-simple-section__body">
                <label className="font-weight-700 d-block">
                  Please outline your relationship with ETA and Contributors of
                  ETA:
                </label>
                {this.renderRelations()}
                <label className="font-weight-700 d-block mt-5">
                  Have you ever received a Grant under this program before?
                </label>
                <p>{proposal.received_grant_before ? "Yes" : "No"}</p>
                <label className="font-weight-700 d-block">
                  {`If the answer to the previous question is YES, have you entirely fulfilled your contractual obligations?`}
                </label>
                <p>{proposal.has_fulfilled ? "Yes" : "No"}</p>
                <label className="font-weight-700 d-block">
                  {`Are you aware that you or another person received a Grant under this Program for a Project which is foundational to your proposed Project.`}
                </label>
                <p>{proposal.received_grant ? "Yes" : "No"}</p>
                <label className="font-weight-700 d-block">
                  {`If the answer to the prior question is yes, please cite any previous work performed under this Program, which is foundational to your proposed Project`}
                </label>
                <p>{proposal.foundational_work}</p>
                {this.renderCitations()}
              </div>
            </div>

            {proposal.include_membership ? (
              <div className="app-simple-section">
                <div className="app-simple-section__title">
                  <label>Membership Proposal</label>
                </div>
                <div className="app-simple-section__body">
                  <label className="font-weight-700 d-block">
                    Why do you want to become a Voting Associate?
                  </label>
                  <p>{proposal.member_reason || ""}</p>
                  <label className="font-weight-700 d-block">
                    As a Voting Associate, what will you bring to the {BRAND}?
                  </label>
                  <p>{proposal.member_benefit || ""}</p>
                  <label className="font-weight-700 d-block">
                    {`Please enter your LinkedIn if you have one (Optional):`}
                  </label>
                  <p>{proposal.linkedin || ""}</p>
                  <label className="font-weight-700 d-block">
                    {`Please enter your github/lab link if you are a developer (Optional):`}
                  </label>
                  <p>{proposal.github || ""}</p>
                </div>
              </div>
            ) : null}

            {this.renderOnboardingSection()}

            <div className="app-simple-section" id="c-proposal-tags">
              <div className="app-simple-section__title">
                <label>Tags</label>
              </div>
              <div className="app-simple-section__body">
                {this.renderTags()}
              </div>
            </div>

            <div className="app-simple-section">
              <div className="app-simple-section__title">
                {this.renderLabelEdition(
                  "Uploaded Files",
                  "files",
                  { files: [...proposal.files] },
                  true
                )}
              </div>
              <div className="app-simple-section__body">
                {this.state.editionField !== "files" && (
                  <ul id="app-spd-fileList" className="mb-4">
                    {this.renderFiles()}
                  </ul>
                )}
                {this.state.editionField === "files" && (
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
                            <p className="color-primary">
                              <Icon.Upload color="#9B64E6" />
                              <span className="pl-2">Add Files</span>
                            </p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                    {this.renderRawFiles()}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Fragment>
    );
  }

  render() {
    const { proposal } = this.state;
    if (!proposal || !proposal.id) return null;

    return (
      <section id="app-single-proposal-detail-section">
        {this.renderContent()}
      </section>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleProposalDetail));
