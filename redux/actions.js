// General
export const SHOW_ALERT = "SHOW_ALERT";
export const HIDE_ALERT = "HIDE_ALERT";
export const SHOW_CANVAS = "SHOW_CANVAS";
export const HIDE_CANVAS = "HIDE_CANVAS";
export const SHOW_SIDEBAR = "SHOW_SIDEBAR";
export const HIDE_SIDEBAR = "HIDE_SIDEBAR";
export const SET_GLOBAL_SETTINGS = "SET_GLOBAL_SETTINGS";
export const SET_THEME = "SET_THEME";

// Modal
export const SET_ACTIVE_MODAL = "SET_ACTIVE_MODAL";
export const REMOVE_ACTIVE_MODAL = "REMOVE_ACTIVE_MODAL";
export const SET_CUSTOM_MODAL_DATA = "SET_CUSTOM_MODAL_DATA";
export const SET_DOS_PAYMENT_DATA = "SET_DOS_PAYMENT_DATA";
export const SET_DOS_REVIEW_DATA = "SET_DOS_REVIEW_DATA";
export const SET_PAYMENT_FORM_DATA = "SET_PAYMENT_FORM_DATA";
export const SET_VIEW_PAYMENT_FORM_DATA = "SET_VIEW_PAYMENT_FORM_DATA";
export const SET_KYC_DATA = "SET_KYC_DATA";
export const SET_PRE_REGISTER_ACTION_DATA = "SET_PRE_REGISTER_ACTION_DATA";
export const SET_MILESTONE_VOTE_DATA = "SET_MILESTONE_VOTE_DATA";
export const SAVE_DRAFT_BEFORE_LOGOUT = "SAVE_DRAFT_BEFORE_LOGOUT";

// Auth
export const SAVE_USER = "SAVE_USER";

// User Actions
export const SET_EDIT_PROPOSAL_DATA = "SET_EDIT_PROPOSAL_DATA";

// Admin Actions
export const SET_REVIEW_USER = "SET_REVIEW_USER";
export const SET_REVIEW_PROPOSAL = "SET_REVIEW_PROPOSAL";
export const FORCE_RELOAD_ADMIN_TEAM = "FORCE_RELOAD_ADMIN_TEAM";
export const FORCE_RELOAD_ACTIVE_SURVEY_TABLE =
  "FORCE_RELOAD_ACTIVE_SURVEY_TABLE";
export const FORCE_RELOAD_GUARD_START_SURVEY =
  "FORCE_RELOAD_GUARD_START_SURVEY";
export const REFRESH_SINGLE_USER_PAGE = "REFRESH_SINGLE_USER_PAGE";
export const SET_MASTER_PASSWORD_STATUS = "SET_MASTER_PASSWORD_STATUS";
export const TOGGLE_EDIT_MODE = "TOGGLE_EDIT_MODE";
export const START_INFORMAL_ADMIN_TOOLS = "START_INFORMAL_ADMIN_TOOLS";

// Table Actions
export const SET_COMPLETED_VOTES_TABLE_STATUS =
  "SET_COMPLETED_VOTES_TABLE_STATUS";
export const SET_INFORMAL_BALLOT_TABLE_STATUS =
  "SET_INFORMAL_BALLOT_TABLE_STATUS";
export const SET_FORMAL_BALLOT_TABLE_STATUS = "SET_FORMAL_BALLOT_TABLE_STATUS";
export const SET_ADMIN_USER_TABLE_STATUS = "SET_ADMIN_USER_TABLE_STATUS";
export const SET_ADMIN_PENDING_USER_TABLE_STATUS =
  "SET_ADMIN_PENDING_USER_TABLE_STATUS";
export const SET_ADMIN_PENDING_ACTION_TABLE_STATUS =
  "SET_ADMIN_PENDING_ACTION_TABLE_STATUS";
export const SET_ADMIN_PENDING_PROPOSAL_TABLE_STATUS =
  "SET_ADMIN_PENDING_PROPOSAL_TABLE_STATUS";
export const SET_ADMIN_ACTIVE_PROPOSAL_TABLE_STATUS =
  "SET_ADMIN_ACTIVE_PROPOSAL_TABLE_STATUS";
export const SET_ONBOARDING_TABLE_STATUS = "SET_ONBOARDING_TABLE_STATUS";
export const SET_PRE_REGISTER_TABLE_STATUS = "SET_PRE_REGISTER_TABLE_STATUS";
export const SET_GRANT_TABLE_STATUS = "SET_GRANT_TABLE_STATUS";
export const SET_MOVE_TO_FORMAL_TABLE_STATUS =
  "SET_MOVE_TO_FORMAL_TABLE_STATUS";

export const setMasterPasswordStatus = (message) => ({
  type: SET_MASTER_PASSWORD_STATUS,
  payload: {
    masterPasswordStatus: message,
  },
});

export const setMoveToFormalTableStatus = (message) => ({
  type: SET_MOVE_TO_FORMAL_TABLE_STATUS,
  payload: {
    moveToFormalTableStatus: message,
  },
});

export const setMilestoneVoteData = (message) => ({
  type: SET_MILESTONE_VOTE_DATA,
  payload: {
    milestoneVoteData: message,
  },
});

export const setGrantTableStatus = (message) => ({
  type: SET_GRANT_TABLE_STATUS,
  payload: {
    grantTableStatus: message,
  },
});

export const setPreRegisterTableStatus = (message) => ({
  type: SET_PRE_REGISTER_TABLE_STATUS,
  payload: {
    preRegisterTableStatus: message,
  },
});

export const setPreRegisterActionData = (message) => ({
  type: SET_PRE_REGISTER_ACTION_DATA,
  payload: {
    preRegisterActionData: message,
  },
});

export const setKYCData = (message) => ({
  type: SET_KYC_DATA,
  payload: {
    kycData: message,
  },
});

export const setViewPaymentFormData = (message) => ({
  type: SET_VIEW_PAYMENT_FORM_DATA,
  payload: {
    viewPaymentFormData: message,
  },
});

export const setPaymentFormData = (message) => ({
  type: SET_PAYMENT_FORM_DATA,
  payload: {
    paymentFormData: message,
  },
});

export const setOnboardingTableStatus = (message) => ({
  type: SET_ONBOARDING_TABLE_STATUS,
  payload: {
    onboardingTableStatus: message,
  },
});

export const setRefreshSingleUserPage = (message) => ({
  type: REFRESH_SINGLE_USER_PAGE,
  payload: {
    refreshSingleUserPage: message,
  },
});

export const setCustomModalData = (message) => ({
  type: SET_CUSTOM_MODAL_DATA,
  payload: {
    customModalData: message,
  },
});

export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: {
    theme,
  },
});

export const showAlert = (message, type = "warning") => ({
  type: SHOW_ALERT,
  payload: {
    showAlertMessage: message,
    showAlertType: type,
  },
});

export const hideAlert = () => ({
  type: HIDE_ALERT,
  payload: {},
});

export const showCanvas = () => ({
  type: SHOW_CANVAS,
  payload: {},
});

export const hideCanvas = () => ({
  type: HIDE_CANVAS,
  payload: {},
});

export const showSidebar = () => ({
  type: SHOW_SIDEBAR,
  payload: {},
});

export const hideSidebar = () => ({
  type: HIDE_SIDEBAR,
  payload: {},
});

export const setActiveModal = (activeModal, modalData = null) => ({
  type: SET_ACTIVE_MODAL,
  payload: {
    activeModal,
    modalData,
  },
});

export const removeActiveModal = () => ({
  type: REMOVE_ACTIVE_MODAL,
  payload: {},
});

export const toggleEditMode = (value) => ({
  type: TOGGLE_EDIT_MODE,
  payload: {
    editMode: value,
  },
});

export const startInformalAdminTools = (value) => ({
  type: START_INFORMAL_ADMIN_TOOLS,
  payload: {
    startInformalAdmin: value,
  },
});

export const setDOSReviewData = (message) => ({
  type: SET_DOS_REVIEW_DATA,
  payload: {
    dosReviewData: message,
  },
});

export const setDOSPaymentData = (message) => ({
  type: SET_DOS_PAYMENT_DATA,
  payload: {
    dosPaymentData: message,
  },
});

export const saveUser = (message) => ({
  type: SAVE_USER,
  payload: {
    authUser: message,
  },
});

export const setGlobalSettings = (message) => ({
  type: SET_GLOBAL_SETTINGS,
  payload: {
    settings: message,
  },
});

export const setCompletedVotesTableStatus = (message) => ({
  type: SET_COMPLETED_VOTES_TABLE_STATUS,
  payload: {
    completedVotesTableStatus: message,
  },
});

export const setInformalBallotTableStatus = (message) => ({
  type: SET_INFORMAL_BALLOT_TABLE_STATUS,
  payload: {
    informalBallotTableStatus: message,
  },
});

export const setFormalBallotTableStatus = (message) => ({
  type: SET_FORMAL_BALLOT_TABLE_STATUS,
  payload: {
    formalBallotTableStatus: message,
  },
});

export const setAdminPendingProposalTableStatus = (message) => ({
  type: SET_ADMIN_PENDING_PROPOSAL_TABLE_STATUS,
  payload: {
    pendingProposalTableStatus: message,
  },
});

export const setAdminActiveProposalTableStatus = (message) => ({
  type: SET_ADMIN_ACTIVE_PROPOSAL_TABLE_STATUS,
  payload: {
    activeProposalTableStatus: message,
  },
});

export const setAdminPendingUserTableStatus = (message) => ({
  type: SET_ADMIN_PENDING_USER_TABLE_STATUS,
  payload: {
    pendingUserTableStatus: message,
  },
});

export const setAdminUserTableStatus = (message) => ({
  type: SET_ADMIN_USER_TABLE_STATUS,
  payload: {
    userTableStatus: message,
  },
});

export const setAdminPendingActionTableStatus = (message) => ({
  type: SET_ADMIN_PENDING_ACTION_TABLE_STATUS,
  payload: {
    pendingActionTableStatus: message,
  },
});

export const setEditProposalData = (message) => ({
  type: SET_EDIT_PROPOSAL_DATA,
  payload: {
    editProposalData: message,
  },
});

export const setReviewUser = (message) => ({
  type: SET_REVIEW_USER,
  payload: {
    reviewUser: message,
  },
});

export const setReviewProposal = (message) => ({
  type: SET_REVIEW_PROPOSAL,
  payload: {
    reviewProposal: message,
  },
});

export const forceReloadAdminTeam = (value) => ({
  type: FORCE_RELOAD_ADMIN_TEAM,
  payload: {
    reloadAdminTeam: value,
  },
});

export const forceReloadActiveSurveyTable = (value) => ({
  type: FORCE_RELOAD_ACTIVE_SURVEY_TABLE,
  payload: {
    reloadActiveSurveyTable: value,
  },
});

export const forceReloadGuardStartSurvey = (value) => ({
  type: FORCE_RELOAD_GUARD_START_SURVEY,
  payload: {
    reloadGuardStartSurvey: value,
  },
});

export const saveDraftBeforeLogout = (value) => {
  return {
    type: SAVE_DRAFT_BEFORE_LOGOUT,
    payload: {
      saveDraft: value,
    },
  };
};
