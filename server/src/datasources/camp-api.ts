import { DataSource, DataSourceConfig } from "apollo-datasource";
import { AuthenticationError } from "apollo-server";
import {
  MutationSynchronizeArgs,
  SynchronizeResponse,
  SyncStatus,
} from "../generated/graphql";
import {
  applyOperationsToCamp,
  Camp,
  CampOperation,
  ChangeCampItemDeletedOperation,
  ChangeCampItemStateOperation,
} from "desert-thing-packing-list-common";
import { Store } from "../model/store";
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

  async syncCamp(
    { campId, opIndex, lastOp, newOps }: MutationSynchronizeArgs,
    testHook?: (hook: string) => Promise<any>
  ): Promise<SynchronizeResponse> {
    let clientOps = newOps as CampOperation[] | undefined;
    if (!this.context?.userId) {
      throw new AuthenticationError("Invalid token");
    }
    if (clientOps && clientOps.length && clientOps[0].type == "CREATE_CAMP") {
      if (opIndex !== 0) {
        throw new Error("CREATE_CAMP must be first operation");
      }
      return this.createCamp(clientOps);
    }
    if (opIndex < 1 || !campId) {
      throw new Error("Invalid arguments");
    }
    const [oldCamp, serverOps] = await this.store.getCampWithOps(
      campId,
      opIndex
    );
    if (!oldCamp || !serverOps) {
      throw new Error("Camp not found");
    }

    if (!clientOps?.length || serverOps.length) {
      return serverOps.length
        ? { status: SyncStatus.NEED_UPDATE, updatedOps: serverOps }
        : { status: SyncStatus.ALL_GOOD };
    }

    if (testHook) await testHook("pre-writeCamp");

    // Update DB with given operations
    const newCamp = applyOperationsToCamp(oldCamp, clientOps);
    const { succeeded } = await this.store.writeCamp(
      newCamp,
      clientOps,
      opIndex
    );
    if (succeeded) {
      return { status: SyncStatus.ALL_GOOD };
    }
    // Failed because someone else wrote changes at the same time, therefore get
    // those changes
    const [latestCamp, latestServerOps] = await this.store.getCampWithOps(
      campId,
      opIndex
    );
    if (!latestCamp || !latestServerOps || !latestServerOps.length) {
      // Oops, didn't find the changes
      throw new Error("Something terrible happened");
    }
    // Can't merge the changes here because if the client has more changes queued then
    // things get really complicated. Therefore just return the latest changes and let
    // the client figure it out.
    return { status: SyncStatus.NEED_UPDATE, updatedOps: latestServerOps };
  }

  private async createCamp(ops: CampOperation[]): Promise<SynchronizeResponse> {
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
    const { succeeded, campId } = await this.store.writeCamp(camp, ops, 0);
    if (!succeeded) {
      throw Error("Create shouldn't fail!");
    }
    await this.store.addCampToUser(this.context.userId, campId);

    return {
      status: SyncStatus.ALL_GOOD,
      campId,
    };
  }
}
