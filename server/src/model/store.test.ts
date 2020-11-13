import { Camp } from 'desert-thing-packing-list-common';
import {Db, MongoClient, ObjectID} from 'mongodb';
import { Store } from './store';

declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string;
      __MONGO_DB_NAME__: string;
    } 
  }
}

describe('insert', () => {
  let store: Store;

  beforeAll(async () => {
    process.env.MONGO_URI = global.__MONGO_URI__;
    store = new Store();
    await store.initialize();
  });

  afterAll(async () => {
    await store.close();
  });

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
                type: "CREATE_CAMP_LIST",
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
      promises.push(addList(campId, i))
    }
    await Promise.all(promises);

    const [finalCamp, ops] = await store.getCampWithOps(campId, 0);
    expect(finalCamp?.lists.length).toBe(count);
    expect(ops.length).toBe(count + 1);
    // console.log({ finalCamp, ops, loopCount });
  });

  async function addList(campId: string, i: number) {
    let nextOp = 1;
    const listName = `List ${i}`;
    const listId = `listid-${i}`;
    const opId = `opid-${i}`;
    let firstTimeRound = true;
    while (true) {
      loopCount++;
      const [camp, ops] = await store.getCampWithOps(campId, nextOp);
      if (!camp) {
        throw Error(`camp is null ${i} ${nextOp}`);
      }
      // console.log(i, camp, ops, nextOp);
      nextOp += ops.length;
      expect(nextOp, listName).toBe(camp.revision);
      if (!firstTimeRound) {
        expect(ops.length).toBeGreaterThan(0);
      } else {
        firstTimeRound = false;
      }
      const { succeeded } = await store.writeCamp(
        {
          ...camp,
          lists: [...camp.lists, { id: listId, name: listName, items: [] }],
        },
        [
          {
            type: "CREATE_CAMP_LIST",
            id: opId,
            timestamp: new Date().toJSON(),
            listId,
            name: listName,
          },
        ],
        nextOp
      );
      if (succeeded) {
        break;
      }
    }
  }
});