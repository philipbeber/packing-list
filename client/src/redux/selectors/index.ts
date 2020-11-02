import { createSelector } from "reselect";
import { AppState } from "../reducers/rootReducer";

export const selectedCampSelector = createSelector(
  (state: AppState) => state.camp.campManagers,
  (state: AppState) => state.camp.selectedCampId,
  (camps, selectedCampId) => {
    return camps.find((c) => c.campId === selectedCampId)?.current;
  }
);

export const selectedListSelector = createSelector(
  (state: AppState) => selectedCampSelector(state),
  (state: AppState) => state.camp.selectedListId,
  (selectedCamp, selectedList) => {
    return selectedCamp?.lists.find((l) => l.id === selectedList);
  }
);
