import {
  SET_REVIEW_USER,
  SET_REVIEW_PROPOSAL,
  SET_ADMIN_USER_TABLE_STATUS,
  SET_ADMIN_PENDING_USER_TABLE_STATUS,
  SET_ADMIN_PENDING_ACTION_TABLE_STATUS,
  SET_ADMIN_PENDING_PROPOSAL_TABLE_STATUS,
  SET_ADMIN_ACTIVE_PROPOSAL_TABLE_STATUS,
  SET_INFORMAL_BALLOT_TABLE_STATUS,
  SET_FORMAL_BALLOT_TABLE_STATUS,
  SET_COMPLETED_VOTES_TABLE_STATUS,
  SET_MASTER_PASSWORD_STATUS,
  REFRESH_SINGLE_USER_PAGE,
  TOGGLE_EDIT_MODE,
  START_INFORMAL_ADMIN_TOOLS,
  FORCE_RELOAD_ADMIN_TEAM,
  FORCE_RELOAD_ACTIVE_SURVEY_TABLE,
  FORCE_RELOAD_GUARD_START_SURVEY,
} from "../actions";

const initialState = {
  reviewUser: {},
  reviewProposal: {},
  userTableStatus: false,
  pendingUserTableStatus: false,
  pendingActionTableStatus: false,
  pendingProposalTableStatus: false,
  activeProposalTableStatus: false,
  informalBallotTableStatus: false,
  formalBallotTableStatus: false,
  completedVotesTableStatus: false,
  refreshSingleUserPage: false,
  masterPasswordStatus: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_MASTER_PASSWORD_STATUS: {
      const { masterPasswordStatus } = action.payload;
      return {
        ...state,
        masterPasswordStatus,
      };
    }
    case REFRESH_SINGLE_USER_PAGE: {
      const { refreshSingleUserPage } = action.payload;
      return {
        ...state,
        refreshSingleUserPage,
      };
    }
    case SET_COMPLETED_VOTES_TABLE_STATUS: {
      const { completedVotesTableStatus } = action.payload;
      return {
        ...state,
        completedVotesTableStatus,
      };
    }
    case SET_INFORMAL_BALLOT_TABLE_STATUS: {
      const { informalBallotTableStatus } = action.payload;
      return {
        ...state,
        informalBallotTableStatus,
      };
    }
    case SET_FORMAL_BALLOT_TABLE_STATUS: {
      const { formalBallotTableStatus } = action.payload;
      return {
        ...state,
        formalBallotTableStatus,
      };
    }
    case SET_ADMIN_PENDING_PROPOSAL_TABLE_STATUS: {
      const { pendingProposalTableStatus } = action.payload;
      return {
        ...state,
        pendingProposalTableStatus,
      };
    }
    case SET_ADMIN_ACTIVE_PROPOSAL_TABLE_STATUS: {
      const { activeProposalTableStatus } = action.payload;
      return {
        ...state,
        activeProposalTableStatus,
      };
    }
    case SET_ADMIN_PENDING_ACTION_TABLE_STATUS: {
      const { pendingActionTableStatus } = action.payload;
      return {
        ...state,
        pendingActionTableStatus,
      };
    }
    case SET_ADMIN_PENDING_USER_TABLE_STATUS: {
      const { pendingUserTableStatus } = action.payload;
      return {
        ...state,
        pendingUserTableStatus,
      };
    }
    case SET_ADMIN_USER_TABLE_STATUS: {
      const { userTableStatus } = action.payload;
      return {
        ...state,
        userTableStatus,
      };
    }
    case SET_REVIEW_USER: {
      const { reviewUser } = action.payload;
      return {
        ...state,
        reviewUser,
      };
    }
    case SET_REVIEW_PROPOSAL: {
      const { reviewProposal } = action.payload;
      return {
        ...state,
        reviewProposal,
      };
    }
    case TOGGLE_EDIT_MODE: {
      const { editMode } = action.payload;
      return {
        ...state,
        editMode,
      };
    }
    case START_INFORMAL_ADMIN_TOOLS: {
      const { startInformalAdmin } = action.payload;
      return {
        ...state,
        startInformalAdmin,
      };
    }
    case FORCE_RELOAD_ADMIN_TEAM: {
      const { reloadAdminTeam } = action.payload;
      return {
        ...state,
        reloadAdminTeam,
      };
    }
    case FORCE_RELOAD_ACTIVE_SURVEY_TABLE: {
      const { reloadActiveSurveyTable } = action.payload;
      return {
        ...state,
        reloadActiveSurveyTable,
      };
    }
    case FORCE_RELOAD_GUARD_START_SURVEY: {
      const { reloadGuardStartSurvey } = action.payload;
      return {
        ...state,
        reloadGuardStartSurvey,
      };
    }
    default:
      return state;
  }
}
