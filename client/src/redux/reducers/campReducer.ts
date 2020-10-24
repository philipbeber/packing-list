import { applyOperationToCamp, Camp, CampOperations } from "../../model";
import { CampActions } from "../actions/campActions";

interface CampState {
  selectedCampId?: string;
  selectedListId?: string;
  camps: Camp[];
  pendingOperations: CampOperations[];
}
export const initialState: CampState = {
  camps: [],
  pendingOperations: [],
};
const campReducer = (
  state: CampState = initialState,
  action: CampActions
): CampState => {
  switch (action.type) {
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
    case "USER_OPERATION": {
      // I.e. an operation that will also be queued and sent to the server
      const operation = action.payload;
      if (operation.type === "CREATE_CAMP") {
        const newCamp = new Camp(operation.campId, operation.name);
        return {
          ...state,
          selectedCampId: operation.campId,
          camps: [...state.camps, newCamp],
          pendingOperations: [...state.pendingOperations, operation],
        };
      }
      const camp = state.camps.find((c) => c.id === operation.campId);
      if (!camp) {
        return state;
      }
      const newCamp = applyOperationToCamp(camp, operation);
      return {
        ...state,
        camps: state.camps.map((c) => (c.id === camp.id ? newCamp : c)),
        pendingOperations: [...state.pendingOperations, operation],
      };
    }
    case "CLEAR_CAMP_DATA":
      // Just used for testing. Will remove this
      return initialState;
    default:
      return state;
  }
};
export default campReducer;
