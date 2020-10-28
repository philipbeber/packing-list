import { DataSource } from "apollo-datasource";
import { AuthenticationError } from "apollo-server";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { MutationSynchronizeArgs, Operation, OperationInput } from "../generated/graphql";
import { CampOperation, ChangeCampItemDeletedOperation, ChangeCampItemStateOperation, ListOperation } from "../model/common";
import { Store } from "../model/store";

export class CampAPI extends DataSource<ExpressContext> {
  private context: any;
  constructor(private store: Store) {
    super();
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  async initialize(config: any) {
    this.context = config.context;
    await this.store.initialize();
  }

  async syncCamp({
    campId,
    opIndex,
    lastOp,
    newOps,
  }: MutationSynchronizeArgs): Promise<Operation[]> {
    if (!this.context.userId) {
      throw new AuthenticationError("Invalid token");
    }
    if (newOps && newOps.length && newOps[0].type == "CREATE_CAMP") {
      return this.createCamp(newOps);
    }
    if (opIndex < 1 || !campId) {
      throw new Error("Invalid arguments");
    }
    const camp = await this.store.getCamp(campId, opIndex);
    if (!camp) {
      throw new Error("Camp not found");
    }
    if (!newOps?.length) {
      return camp.ops;
    }
    const clientOps = newOps as CampOperation[];
    this.transformOps(clientOps, camp.ops);
    return [];
  }

  transformOps(clientOps: CampOperation[], serverOps: CampOperation[]) {
    serverOps.forEach((serverOp) => {
      for (let index = 0; index < clientOps.length; index++) {
        const clientOp = clientOps[index];
        const [newClientOp, newServerOp] = this.transformOp(clientOp, serverOp);
        if (newClientOp !== clientOp) {
          serverOps[index] = newClientOp;
        }
        if (newServerOp.type === "IDENTITY") {
          break;
        }
        serverOp = newServerOp;
      }
    });
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
    const newItemIds = clientOp.itemIds.filter(id => serverOp.itemIds.indexOf(id) < 0);
    if (newItemIds.length === clientOp.itemIds.length) {
      return [clientOp, serverOp];
    }
    if (newItemIds.length === 0) {
      return [{ ...clientOp, type: "IDENTITY" }, serverOp];
    }
    const newClientOp = {
      ...clientOp,
      itemIds: newItemIds
    }
    return [newClientOp, serverOp];
  }

  async createCamp(ops: OperationInput[]) {
    return ops.map((op) => ({
      type: op.type,
      id: op.id,
      timestamp: op.timestamp,
    }));
  }
}
