import {
  SAVE_DRAFT_BEFORE_LOGOUT,
  SET_EDIT_PROPOSAL_DATA,
  SET_ATTESTATION_DATA,
  SET_DISCOURSE_NOTIFICATIONS,
  LOAD_DISCOURSE_NOTIFICATIONS,
  SEE_ALL_DISCOURSE_NOTIFICATIONS,
  READ_DISCOURSE_NOTIFICATION,
} from "../actions";

const initialState = {
  editProposalData: {},
  attestationData: {
    attestation_rate: 0,
    is_attestated: false,
    in_discussion: false,
    related_to_proposal: false,
  },
  discourseNotifications: {
    notifications: [],
    total_rows_notifications: 0,
    loading: true,
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
    case LOAD_DISCOURSE_NOTIFICATIONS: {
      return {
        ...state,
        discourseNotifications: {
          ...state.discourseNotifications,
          loading: true,
        },
      };
    }
    case SEE_ALL_DISCOURSE_NOTIFICATIONS: {
      return {
        ...state,
        discourseNotifications: {
          ...state.discourseNotifications,
          seen_notification_id:
            state.discourseNotifications.notifications[0].id,
        },
      };
    }
    case READ_DISCOURSE_NOTIFICATION: {
      return {
        ...state,
        discourseNotifications: {
          ...state.discourseNotifications,
          notifications: [...state.discourseNotifications.notifications].map(
            (notification) => {
              if (notification.id === action.payload.id) {
                notification.read = true;
              }

              return notification;
            }
          ),
        },
      };
    }
    case SET_DISCOURSE_NOTIFICATIONS: {
      const { discourseNotifications } = action.payload;
      return {
        ...state,
        discourseNotifications,
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
