import { createSelector } from "reselect";
import { AppState } from "../reducers/rootReducer";

export const selectedCampSelector = createSelector(
  (state: AppState) => state.camp.camps,
  (state: AppState) => state.camp.selectedCampId,
  (camps, selectedCampId) => {
    return camps.find((c) => c.id === selectedCampId);
  }
);

export const selectedListSelector = createSelector(
  (state: AppState) => selectedCampSelector(state),
  (state: AppState) => state.camp.selectedListId,
  (selectedCamp, selectedList) => {
    return selectedCamp?.lists.find((l) => l.id === selectedList);
  }
);
