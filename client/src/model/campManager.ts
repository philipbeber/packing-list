import {
  applyOperationsToCamp,
  applyOperationToCamp,
  Camp,
  CampOperation,
  CreateCampOperation,
  transformOps,
} from "desert-thing-packing-list-common";
import { synchronize } from "../apollo/sync";
import { SyncStatus } from "../__generated__/globalTypes";
import { Dispatch } from "react";
import { CampActions } from "../redux/actions/campActions";
import { AppState } from "../redux/reducers/rootReducer";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { debounce } from "../util/debounce";

export interface CampManager {
  readonly campId: string;
  readonly current: Camp;
  readonly server?: Camp;
  readonly lastServerOperation: number;
  readonly operations: CampOperation[];
  readonly synchronizing: boolean;
}

function createNewCampManager(
  id: string,
  operation: CreateCampOperation
): CampManager {
  return {
    campId: id,
    current: {
      id, 
      name: operation.name,
      lists: [],
      revision: 1
    },
    operations: [operation],
    lastServerOperation: 0,
    synchronizing: false,
  };
}

export function connectCamp(camp: Camp): CampManager {
  return {
    campId: camp.id,
    current: camp,
    server: camp,
    lastServerOperation: camp.revision || 0,
    operations: [],
    synchronizing: false
  }
}

export function applyUserOperation(
  dispatch: Dispatch<CampActions>,
  getState: () => AppState,
  campId: string,
  operation: CampOperation
) {
  // lazySynchronizeCamp(dispatch, getState, client, campId);  
  const state = getState();
  if (operation.type === "CREATE_CAMP") {
    const newCampMgr = createNewCampManager(campId, operation);
    dispatch({
      type: "CREATE_CAMP",
      cm: newCampMgr
    });
    return;
  }
  const cm = state.camp.campManagers.find((c) => c.campId === campId);
  if (!cm) {
    return;
  }
  dispatch({
    type: "UPDATE_CAMP",
    cm: {
      ...cm,
      current: applyOperationToCamp(cm.current, operation),
      operations: [...cm.operations, operation],
    }
  })
}

export function resetCampManager(cm: CampManager): CampManager {
  return {
    ...cm,
    synchronizing: false
  }
}

let lazySynchronizeMap = new Map<string, typeof synchronizeCamp>();
export function resetLazySynchronizeMap() {
  lazySynchronizeMap = new Map<string, typeof synchronizeCamp>();
}

export function lazySynchronizeCamp(
  dispatch: Dispatch<CampActions>,
  getState: () => AppState,
  client: ApolloClient<NormalizedCacheObject>,
  campId: string
) {
  let func = lazySynchronizeMap.get(campId);
  if (!func) {
    func = debounce(synchronizeCamp, 2000);
    lazySynchronizeMap.set(campId, func);
  }
  func(dispatch, getState, client, campId);
}

export function synchronizeCamp(
  dispatch: Dispatch<CampActions>,
  getState: () => AppState,
  client: ApolloClient<NormalizedCacheObject>,
  campId: string
) {
  const state = getState();
  const cm = state.camp.campManagers.find(cm => cm.campId === campId);
  if (!cm) {
    return;
  }
  if (cm.synchronizing) {
    lazySynchronizeCamp(dispatch, getState, client, campId);
    return;
  }

  startSync(dispatch, getState, client, cm);
}

async function startSync(
  dispatch: Dispatch<CampActions>,
  getState: () => AppState,
  client: ApolloClient<NormalizedCacheObject>,
  cm: CampManager
) {
  const state = getState();
  const token = state.user.token;
  const userId = state.user.info?.id;
  if (!token || !userId) {
    return;
  }
  try {
    dispatch({
      type: "SYNCHRONIZE_START",
      campId: cm.campId
    });
    const result = await synchronize(
      client,
      cm.campId,
      cm.lastServerOperation,
      undefined,
      cm.operations,
      token
    );
    const token2 = getState().user.token;
    if (token !== token2) {
      // User logged out or whatever
      return;
    }
    syncResponse(dispatch, getState, client, cm.campId, cm.operations.length, result);
  } catch (error) {
    console.error(error);
    syncResponse(dispatch, getState, client, cm.campId, cm.operations.length, {
      status: SyncStatus.RETRY,
    });
  }
}

function syncResponse(
  dispatch: Dispatch<CampActions>,
  getState: () => AppState,
  client: ApolloClient<NormalizedCacheObject>,
  campId: string,
  operationCount: number,
  result: {
    status: SyncStatus;
    serverOps?: CampOperation[];
    campId?: string;
  }
) {
  const state = getState();
  const cm = state.camp.campManagers.find(cm => cm.campId === campId);
  if (!cm) {
    return;
  }
  switch (result.status) {
    case SyncStatus.RETRY:
      console.error("It failed");
      // lazySynchronizeCamp(dispatch, getState, client, campId);
      dispatch({
        type: "SYNCHRONIZE_RESPONSE",
        campId: cm.campId,
        cm: {
          ...cm,
          synchronizing: false
        } 
      });
      return;
    case SyncStatus.ALL_GOOD:
      // The server accepted our changes and is in sync with us
      // Note: It's possible for the id to change for camp-creation events
      const current =
        result.campId && result.campId !== cm.campId
          ? {
              ...cm.current,
              id: result.campId,
            }
          : cm.current;
      dispatch({
        type: "SYNCHRONIZE_RESPONSE",
        campId: cm.campId,
        cm: {
          ...cm,
          current,
          server: current,
          operations: cm.operations.slice(operationCount),
          lastServerOperation: cm.lastServerOperation + operationCount,
          campId: result.campId || cm.campId,
          synchronizing: false,
        },
      });
      return;
    case SyncStatus.NEED_UPDATE: {
      // The server rejected our changes and sent back some of its own
      if (!cm.server || !result.serverOps) {
        throw Error("Catastrophic error");
      }

      // cm.server contains state of camp before pending operations. Rollback to that,
      // apply new operations, then re-apply the pending operations.
      const newServer = applyOperationsToCamp(cm.server, result.serverOps);
      const newClientOps = transformOps(cm.operations, result.serverOps);
      lazySynchronizeCamp(dispatch, getState, client, campId);
      dispatch({
        type: "SYNCHRONIZE_RESPONSE",
        campId: cm.campId,
        cm: {
          ...cm,
          server: newServer,
          current: applyOperationsToCamp(newServer, newClientOps),
          operations: newClientOps,
          lastServerOperation: cm.lastServerOperation + result.serverOps.length,
          synchronizing: false,
        },
      });
      return;
    }
    default:
      throw Error("Unknown sync state: " + result.status);
  }
}

