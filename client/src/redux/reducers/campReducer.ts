import { CampManager, connectCamp } from "../../model/campManager";
import { CampActions } from "../actions/campActions";

interface CampState {
  selectedCampId?: string;
  selectedListId?: string;
  campManagers: CampManager[];
}
export const initialState: CampState = {
  campManagers: []
};
const campReducer = (
  state: CampState = initialState,  
  action: CampActions
): CampState => {
  switch (action.type) {
    case "SYNCHRONIZE_START": {
      return {
        ...state,
        campManagers: state.campManagers.map((cm) =>
          cm.campId === action.campId ? { ...cm, synchronizing: true } : cm
        ),
      };
    }
    case "SYNCHRONIZE_RESPONSE": {
      const oldCM = state.campManagers.find(cm => cm.campId === action.campId);
      if (!oldCM) {
        return state;
      }
      const newCM = action.cm;
      return {
        ...state,
        selectedCampId:
          state.selectedCampId === oldCM.campId
            ? newCM.campId
            : state.selectedCampId,
        campManagers: state.campManagers.map((cm) =>
          cm.campId === oldCM.campId ? newCM : cm
        ),
      };
    }
    case "OPEN_CAMP": {
      return {
        ...state,
        selectedCampId: action.payload,
      };
    }
    case "CLOSE_CAMP": {
      return {
        ...state,
        selectedCampId: undefined,
      };
    }
    case "OPEN_CAMP_LIST": {
      return {
        ...state,
        selectedListId: action.payload.listId,
      };
    }
    case "CLOSE_CAMP_LIST": {
      return {
        ...state,
        selectedListId: undefined,
      };
    }
    case "CREATE_CAMP": {
      return {
        ...state,
        selectedCampId: action.cm.campId,
        campManagers: [...state.campManagers, action.cm]
      };
    }
    case "UPDATE_CAMP": {
      return {
        ...state,
        campManagers: state.campManagers.map((c) =>
          c.campId === action.cm.campId ? action.cm : c
        ),
      };
    }
    case "LOGIN":
      return {
        campManagers: action.camps.map(camp => connectCamp(camp)),
        selectedCampId: undefined,
        selectedListId: undefined
      }
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
};
export default campReducer;
