import { DataSource, DataSourceConfig } from "apollo-datasource";
import { AuthenticationError } from "apollo-server";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import {
  MutationSynchronizeArgs,
  Operation,
  OperationInput,
  SynchronizeResponse,
  SyncStatus,
} from "../generated/graphql";
import {
  applyOperationsToCamp,
  Camp,
  CampOperation,
  ChangeCampItemDeletedOperation,
  ChangeCampItemStateOperation,
  ListOperation,
} from "desert-thing-packing-list-common";
import { DbCamp, Store } from "../model/store";
import { MyContext } from "./user";

export class CampAPI extends DataSource<MyContext> {
  private context?: MyContext;
  constructor(private store: Store) {
    super();
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  async initialize(config: DataSourceConfig<MyContext>) {
    this.context = config.context;
    await this.store.initialize();
  }

  async syncCamp({
    campId,
    opIndex,
    lastOp,
    newOps,
  }: MutationSynchronizeArgs): Promise<SynchronizeResponse> {
    let clientOps = newOps as CampOperation[] | undefined;
    if (!this.context?.userId) {
      throw new AuthenticationError("Invalid token");
    }
    if (clientOps && clientOps.length && clientOps[0].type == "CREATE_CAMP") {
      return this.createCamp(clientOps);
    }
    if (opIndex < 1 || !campId) {
      throw new Error("Invalid arguments");
    }
    if (!clientOps?.length) {
      const serverOps = await this.store.getCampOps(campId, opIndex);
      if (!serverOps) {
        throw new Error("Camp not found");
      }
      return serverOps.length
        ? { status: SyncStatus.NEED_UPDATE, updatedOps: serverOps }
        : { status: SyncStatus.ALL_GOOD };
    }
    const serverOps = [] as CampOperation[];
    while (true) {
      const [oldCamp, newServerOps] = await this.store.getCampWithOps(
        campId,
        opIndex
      );
      if (!oldCamp) {
        throw new Error("Camp not found");
      }
      serverOps.push(...newServerOps);
      opIndex += newServerOps.length;
      clientOps = this.transformOps(clientOps, newServerOps);
      if (clientOps.length === 0) {
        return serverOps.length
          ? { status: SyncStatus.NEED_UPDATE, updatedOps: serverOps }
          : { status: SyncStatus.ALL_GOOD };
      }
      const newCamp = applyOperationsToCamp(oldCamp, clientOps);
      const success = this.store.writeCamp(newCamp, clientOps, opIndex);
      if (success) {
        return serverOps.length
          ? {
              status: SyncStatus.NEED_UPDATE,
              updatedOps: [...serverOps, ...clientOps],
            }
          : { status: SyncStatus.ALL_GOOD };
      }
    }
  }

  async createCamp(ops: CampOperation[]): Promise<SynchronizeResponse> {
    if (!this.context?.userId) {
      throw new AuthenticationError("Invalid token");
    }

    const createOp = ops[0];
    if (createOp.type !== "CREATE_CAMP" || !createOp.name) {
      throw Error("No name");
    }
    let camp: Camp = {
      id: "",
      name: createOp.name,
      lists: [],
      revision: 1,
    };
    if (ops.length > 1) {
      camp = applyOperationsToCamp(camp, ops.slice(1) as CampOperation[]);
    }
    const campId = await this.store.createCamp({
      name: camp.name,
      lists: camp.lists,
      ops: ops,
      opCount: ops.length,
    });

    await this.store.addCampToUser(this.context.userId, campId);

    return {
      status: SyncStatus.ALL_GOOD,
      campId,
    };
  }

  transformOps(
    clientOps: CampOperation[],
    serverOps: CampOperation[]
  ): CampOperation[] {
    let newOps = clientOps;
    let changed = false;
    serverOps.forEach((serverOp) => {
      for (let index = 0; index < newOps.length; index++) {
        const clientOp = newOps[index];
        const [newClientOp, newServerOp] = this.transformOp(clientOp, serverOp);
        if (newClientOp !== clientOp) {
          if (!changed) {
            newOps = newOps.slice(0);
            changed = true;
          }
          if (newClientOp.type === "IDENTITY") {
            newOps.splice(index, 1);
            index--;
          } else {
            newOps[index] = newClientOp;
          }
        }
        if (newServerOp.type === "IDENTITY") {
          break;
        }
        serverOp = newServerOp;
      }
    });
    return newOps;
  }

  transformOp(
    clientOp: CampOperation,
    serverOp: CampOperation
  ): [CampOperation, CampOperation] {
    if (clientOp.timestamp > serverOp.timestamp) {
      // For now only simple operations are supported, so earlier ones will always be overwritten
      return [clientOp, { ...serverOp, type: "IDENTITY" }];
    }
    if (clientOp.type !== serverOp.type) {
      return [clientOp, serverOp];
    }
    switch (clientOp.type) {
      case "CREATE_CAMP_LIST":
      case "CREATE_CAMP_ITEM":
        return [clientOp, serverOp];
      case "CHANGE_CAMP_ITEM_DELETED":
      case "CHANGE_CAMP_ITEM_STATE":
        return this.transformListOp(
          clientOp,
          serverOp as
            | ChangeCampItemStateOperation
            | ChangeCampItemDeletedOperation
        );
      default:
        throw Error("Illegal client op type: " + clientOp.type);
    }
  }

  // Client op happened before server op but will appear after it in the list, therefore just remove
  // any item ids that appear in the server operation.
  transformListOp(
    clientOp: ChangeCampItemStateOperation | ChangeCampItemDeletedOperation,
    serverOp: ChangeCampItemStateOperation | ChangeCampItemDeletedOperation
  ): [CampOperation, CampOperation] {
    if (clientOp.listId !== serverOp.listId) {
      return [clientOp, serverOp];
    }
    const newItemIds = clientOp.itemIds.filter(
      (id) => serverOp.itemIds.indexOf(id) < 0
    );
    if (newItemIds.length === clientOp.itemIds.length) {
      return [clientOp, serverOp];
    }
    if (newItemIds.length === 0) {
      return [{ ...clientOp, type: "IDENTITY" }, serverOp];
    }
    const newClientOp = {
      ...clientOp,
      itemIds: newItemIds,
    };
    return [newClientOp, serverOp];
  }
}
