import {
  SET_DOS_PAYMENT_DATA,
  SET_DOS_REVIEW_DATA,
  SET_PAYMENT_FORM_DATA,
  SET_VIEW_PAYMENT_FORM_DATA,
  SET_KYC_DATA,
  SET_PRE_REGISTER_ACTION_DATA,
  SET_MILESTONE_VOTE_DATA,
} from "../actions";

const initialState = {
  dosPaymentData: {},
  dosReviewData: {},
  paymentFormData: {},
  viewPaymentFormData: {},
  kycData: {},
  preRegisterActionData: {},
  milestoneVoteData: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_MILESTONE_VOTE_DATA: {
      const { milestoneVoteData } = action.payload;
      return {
        ...state,
        milestoneVoteData,
      };
    }
    case SET_PRE_REGISTER_ACTION_DATA: {
      const { preRegisterActionData } = action.payload;
      return {
        ...state,
        preRegisterActionData,
      };
    }
    case SET_KYC_DATA: {
      const { kycData } = action.payload;
      return {
        ...state,
        kycData,
      };
    }
    case SET_VIEW_PAYMENT_FORM_DATA: {
      const { viewPaymentFormData } = action.payload;
      return {
        ...state,
        viewPaymentFormData,
      };
    }
    case SET_PAYMENT_FORM_DATA: {
      const { paymentFormData } = action.payload;
      return {
        ...state,
        paymentFormData,
      };
    }
    case SET_DOS_REVIEW_DATA: {
      const { dosReviewData } = action.payload;
      return {
        ...state,
        dosReviewData,
      };
    }
    case SET_DOS_PAYMENT_DATA: {
      const { dosPaymentData } = action.payload;
      return {
        ...state,
        dosPaymentData,
      };
    }
    default:
      return state;
  }
}
