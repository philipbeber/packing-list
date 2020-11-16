import {
  Camp,
  CampOperation,
  RenameCampListOperation,
  Item,
  ItemState,
  List,
} from "desert-thing-packing-list-common";
import { Db, MongoClient, ObjectID } from "mongodb";
import { createStore, Store } from "./store";

declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string;
      __MONGO_DB_NAME__: string;
    }
  }
}

process.env.MONGO_URI = global.__MONGO_URI__;
export const store = createStore();

describe("insert", () => {

  beforeAll(async () => {
    await store.initialize();
  });

  afterAll(async () => {
    await store.close();
  });

  // Create 10 lists at the same time and ensure only 1 succeeds
  it("should create 1 list", async () => {
    const opId = "op123";
    const timestamp = new Date().toJSON();
    const camp = { id: "", name: "Test Camp", lists: [], revision: 1 } as Camp;
    const { succeeded, campId } = await store.writeCamp(
      camp,
      [{ id: opId, timestamp, type: "CREATE_CAMP", name: "Test Camp" }],
      0
    );
    expect(succeeded).toBe(true);
    console.log(campId);
    let log = "";
    let promises = [] as Promise<{
      succeeded: boolean;
      listId: string;
      camp: Camp;
    }>[];

    for (let i = 0; i < 10; i++) {
      const listName = `List ${i}`;
      const listId = `listid-${i}`;
      const newCamp = {
        ...camp,
        id: campId,
        lists: [{ id: listId, name: listName, items: [] }],
      } as Camp;
      const timestamp = new Date().toJSON();
      log += `start ${listId}\n`;
      promises.push(
        store
          .writeCamp(
            newCamp,
            [
              {
                id: `opid-${i}`,
                timestamp,
                type: "RENAME_CAMP_LIST",
                name: listName,
                listId: listId,
              },
            ],
            i + 1
          )
          .then((result) => {
            log += `end ${listId}\n`;
            return {
              succeeded: result.succeeded,
              listId,
              camp: newCamp,
            };
          })
      );
    }

    const results = await Promise.all(promises);
    // console.log(results.filter((r) => r.succeeded).map((r) => r.listId));
    const succeedCount = results.reduce((p, c) => p + (c.succeeded ? 1 : 0), 0);
    expect(succeedCount).toBe(1);
    // console.log(log);
  });

  let loopCount = 0;

  // Create 25 lists at the same time and retry the failed ones until they all succeed, then
  // verify the DB is in a consistent state.
  it("should create 25 lists", async () => {
    const opId = "op123";
    const timestamp = new Date().toJSON();
    const camp = { id: "", name: "Test Camp", lists: [], revision: 1 } as Camp;
    const { succeeded, campId } = await store.writeCamp(
      camp,
      [{ id: opId, timestamp, type: "CREATE_CAMP", name: "Test Camp" }],
      0
    );
    expect(succeeded).toBe(true);
    let promises = [] as Promise<void>[];

    const count = 25;
    for (let i = 0; i < count; i++) {
      promises.push(addEmptyList(campId, i));
    }
    await Promise.all(promises);

    const [finalCamp, ops] = await store.getCampWithOps(campId, 0);
    expect(finalCamp?.lists.length).toBe(count);
    expect(ops.length).toBe(count + 1);
    // console.log({ finalCamp, ops, loopCount });
  });

  async function addEmptyList(campId: string, i: number) {
    const listName = `List ${i}`;
    const listId = `listid-${i}`;
    const opId = `opid-${i}`;
    const list: List = { id: listId, name: listName, items: [] };
    const ops: CampOperation[] = [
      {
        type: "RENAME_CAMP_LIST",
        id: opId,
        timestamp: new Date().toJSON(),
        listId,
        name: listName,
      },
    ];
    return addList(campId, list, ops);
  }

  async function addList(campId: string, list: List, ops: CampOperation[]) {
    let nextOp = 1;
    let firstTimeRound = true;
    while (true) {
      loopCount++;
      const [camp, serverOps] = await store.getCampWithOps(campId, nextOp);
      if (!camp) {
        throw Error(`camp is null ${list.id} ${nextOp}`);
      }
      // console.log(i, camp, ops, nextOp);
      nextOp += serverOps.length;
      expect(nextOp, list.name).toBe(camp.revision);
      if (!firstTimeRound) {
        expect(serverOps.length).toBeGreaterThan(0);
      } else {
        firstTimeRound = false;
      }
      const { succeeded } = await store.writeCamp(
        {
          ...camp,
          lists: [...camp.lists, list],
        },
        ops,
        nextOp
      );
      if (succeeded) {
        break;
      }
    }
  }

  // Create 10 lists at the same time, each with a bunch of items so that the total number of operations
  // exceeds the chunk size
  it("should create 10 lists", async () => {
    const opId = "op123";
    const timestamp = new Date().toJSON();
    const camp = { id: "", name: "Test Camp", lists: [], revision: 1 } as Camp;
    const { succeeded, campId } = await store.writeCamp(
      camp,
      [{ id: opId, timestamp, type: "CREATE_CAMP", name: "Test Camp" }],
      0
    );
    expect(succeeded).toBe(true);
    let promises = [] as Promise<void>[];

    const listCount = 10;
    const itemCount = 28;
    for (let i = 0; i < listCount; i++) {
      const list: List = {
        id: `list-${i}`,
        name: `List ${i}`,
        items: [],
      };
      const ops: CampOperation[] = [
        {
          id: `op-${i}`,
          timestamp: new Date().toJSON(),
          type: "RENAME_CAMP_LIST",
          listId: list.id,
          name: list.name,
        },
      ];
      for (let j = 0; j < itemCount; j++) {
        const item: Item = {
          id: `item-${i}-${j}`,
          name: `Item ${i}-${j}`,
          state: ItemState.PACKEDIN,
          deleted: false,
        };
        list.items.push(item);
        ops.push({
          id: `op-${i}-${j}`,
          timestamp: new Date().toJSON(),
          type: "RENAME_CAMP_ITEM",
          itemId: item.id,
          listId: list.id,
          name: item.name,
        });
      }
      promises.push(addList(campId, list, ops));
    }
    await Promise.all(promises);

    const [finalCamp, ops] = await store.getCampWithOps(campId, 0);
    expect(finalCamp?.lists.length).toBe(listCount);
    expect(ops.length).toBe(listCount * (itemCount + 1) + 1);
    // console.log({ finalCamp, ops, loopCount });
  });
});
