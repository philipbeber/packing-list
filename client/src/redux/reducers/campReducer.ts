import { applyUserOperation, CampManager, connectCamp, createNewCamp, synchronizeCamp, syncResponse } from "../../model/campManager";
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
    case "SYNCHRONIZE": {
      return {
        ...state,
        campManagers: state.campManagers.map(cm => synchronizeCamp(cm))
      }
    }
    case "SYNCHRONIZE_RESPONSE": {
      const oldCM = state.campManagers.find(cm => cm.campId === action.campId);
      if (!oldCM) {
        return state;
      }
      const newCM = syncResponse(oldCM, action.operationCount, action.result);
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
    case "USER_OPERATION": {
      // I.e. an operation that will also be queued and sent to the server
      const operation = action.op;
      if (operation.type === "CREATE_CAMP") {
        const newCampMgr = createNewCamp(action.campId, operation);
        return {
          ...state,
          selectedCampId: action.campId,
          campManagers: [...state.campManagers, newCampMgr]
        };
      }
      const campMgr = state.campManagers.find((c) => c.campId === action.campId);
      if (!campMgr) {
        return state;
      }
      const newCamp = applyUserOperation(campMgr, operation);
      return {
        ...state,
        campManagers: state.campManagers.map((c) => (c.campId === action.campId ? newCamp : c))
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
