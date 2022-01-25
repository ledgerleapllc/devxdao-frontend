import {
  SAVE_DRAFT_BEFORE_LOGOUT,
  SET_EDIT_PROPOSAL_DATA,
  SET_ATTESTATION_DATA,
} from "../actions";

const initialState = {
  editProposalData: {},
  attestationData: {
    attestation_rate: 0,
    is_attestated: false,
    in_discussion: false,
    related_to_proposal: false,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_EDIT_PROPOSAL_DATA: {
      const { editProposalData } = action.payload;
      return {
        ...state,
        editProposalData,
      };
    }
    case SET_ATTESTATION_DATA: {
      const { attestationData } = action.payload;
      return {
        ...state,
        attestationData: {
          ...state.attestationData,
          ...attestationData,
        },
      };
    }
    case SAVE_DRAFT_BEFORE_LOGOUT: {
      const { saveDraft } = action.payload;
      return {
        ...state,
        saveDraft,
      };
    }
    default:
      return state;
  }
}
