import { CampOperation } from "desert-thing-packing-list-common";
import { Dispatch } from "react";
import { Action } from "redux";
import { applyUserOperation, synchronizeCamp } from "../../model/campManager";
import { AppState } from "../reducers/rootReducer";
import { ThunkAction } from "redux-thunk";
import { CampActions } from "./campActions";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

export const synchronizeCampsAction = (
  client: ApolloClient<NormalizedCacheObject>
) => async (dispatch: Dispatch<CampActions>, getState: () => AppState) => {
  const state = getState();
  if (!state.user.token) {
    return;
  }
  state.camp.campManagers.forEach((cm) => {
    if (!state.camp.selectedCampId || state.camp.selectedCampId === cm.campId) {
      synchronizeCamp(dispatch, getState, client, cm.campId);
    }
  });
};

export const userOperationAction = (campId: string, op: CampOperation) => {
  return async (dispatch: Dispatch<CampActions>, getState: () => AppState) => {
    applyUserOperation(dispatch, getState, campId, op);
  };
};

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;
