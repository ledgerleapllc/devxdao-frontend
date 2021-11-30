import {
  SET_ONBOARDING_TABLE_STATUS,
  SET_PRE_REGISTER_TABLE_STATUS,
  SET_GRANT_TABLE_STATUS,
  SET_MOVE_TO_FORMAL_TABLE_STATUS,
} from "../actions";

const initialState = {
  onboardingTableStatus: false,
  preRegisterTableStatus: false,
  grantTableStatus: false,
  moveToFormalTableStatus: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_MOVE_TO_FORMAL_TABLE_STATUS: {
      const { moveToFormalTableStatus } = action.payload;
      return {
        ...state,
        moveToFormalTableStatus,
      };
    }
    case SET_GRANT_TABLE_STATUS: {
      const { grantTableStatus } = action.payload;
      return {
        ...state,
        grantTableStatus,
      };
    }
    case SET_ONBOARDING_TABLE_STATUS: {
      const { onboardingTableStatus } = action.payload;
      return {
        ...state,
        onboardingTableStatus,
      };
    }
    case SET_PRE_REGISTER_TABLE_STATUS: {
      const { preRegisterTableStatus } = action.payload;
      return {
        ...state,
        preRegisterTableStatus,
      };
    }
    default:
      return state;
  }
}
