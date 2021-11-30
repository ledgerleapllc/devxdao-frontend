import { SAVE_DRAFT_BEFORE_LOGOUT, SET_EDIT_PROPOSAL_DATA } from "../actions";

const initialState = {
  editProposalData: {},
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
