import _ from "lodash";
import {
  applyOperationsToCamp,
  applyOperationToCamp,
  Camp,
  CampOperation,
  CreateCampOperation,
} from "desert-thing-packing-list-common";
import { synchronize } from "../apollo/sync";
import { SyncStatus } from "../__generated__/globalTypes";
import store from "../redux/store";

export interface CampManager {
  readonly campId: string;
  readonly current: Camp;
  readonly server?: Camp;
  readonly lastServerOperation: number;
  readonly operations: CampOperation[];
  readonly synchronizing: boolean;
}

export function createNewCamp(
  id: string,
  operation: CreateCampOperation
): CampManager {
  lazySynchronize();
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

export function resetCampManager(cm: CampManager): CampManager {
  return {
    ...cm,
    synchronizing: false
  }
}

const lazySynchronize = _.debounce(sendSyncAction, 2000);

function sendSyncAction() {
  store.dispatch({
    type: "SYNCHRONIZE",
  });
}

export function synchronizeCamp(cm: CampManager): CampManager {
  if (cm.synchronizing) {
    lazySynchronize();
    return cm;
  }

  startSync(cm);
  return {
    ...cm,
    synchronizing: true,
  };
}

async function startSync(cm: CampManager) {
  const operationCount = cm.operations.length;
  try {
    const result = await synchronize(
      cm.campId,
      cm.lastServerOperation,
      undefined,
      cm.operations
    );
    store.dispatch({
      type: "SYNCHRONIZE_RESPONSE",
      campId: cm.campId,
      operationCount,
      result,
    });
  } catch (error) {
    console.error(error);
    store.dispatch({
      type: "SYNCHRONIZE_RESPONSE",
      campId: cm.campId,
      operationCount,
      result: {
        status: SyncStatus.RETRY,
      },
    });
  }
}

export function syncResponse(
  cm: CampManager,
  operationCount: number,
  result: {
    status: SyncStatus;
    serverOps?: CampOperation[];
    campId?: string;
  }
): CampManager {
  switch (result.status) {
    case SyncStatus.RETRY:
      console.error("It failed");
      return {
        ...cm,
        synchronizing: false,
      };
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
      return {
        ...cm,
        current,
        server: current,
        operations: cm.operations.slice(operationCount),
        lastServerOperation: cm.lastServerOperation + operationCount,
        campId: result.campId || cm.campId,
        synchronizing: false,
      };
    case SyncStatus.NEED_UPDATE:
      // The server merged our changes
      if (!cm.server || !result.serverOps || !!result.campId) {
        throw Error("Catastrophic error");
      }
      const newServer = applyOperationsToCamp(cm.server, result.serverOps);
      const newClientOps = cm.operations.slice(operationCount);
      return {
        ...cm,
        server: newServer,
        current: applyOperationsToCamp(newServer, newClientOps),
        operations: newClientOps,
        lastServerOperation: cm.lastServerOperation + result.serverOps.length,
        synchronizing: false,
      };
    default:
      throw Error("Unknown sync state: " + result.status);
  }
}

export function applyUserOperation(cm: CampManager, operation: CampOperation) {
  lazySynchronize();
  return {
    ...cm,
    current: applyOperationToCamp(cm.current, operation),
    operations: [...cm.operations, operation],
  };
}
