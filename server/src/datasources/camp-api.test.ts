import { Camp, CampOperation, Item, ItemState, List } from 'desert-thing-packing-list-common';
import {Db, MongoClient, ObjectID} from 'mongodb';
import { MyContext } from '.';
import { CampAPI } from './camp-api';
import { Store } from '../model/store';
import { SynchronizeResponse, SyncStatus } from '../generated/graphql';
import { store } from '../model/store.test';
import * as bson from 'bson';

declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string;
      __MONGO_DB_NAME__: string;
    } 
  }
}

describe('camp API', () => {
  let campAPI: CampAPI;
  let context: MyContext = {};
  let nextId = 1;

  beforeAll(async () => {
    await store.initialize();
    campAPI = new CampAPI(store);
    await campAPI.initialize({context} as any);
  });

  afterAll(async () => {
    await store.close();
  });

  it("create a camp", async () => {
    const ops: CampOperation[] = [
      {
        ...opBoilerplate(),
        type: "CREATE_CAMP",
        name: "Camp 1",
      },
    ];
    context.userId = await store.createUser("user1", "User Name", "password");
    const result = await campAPI.syncCamp({
      campId: "",
      opIndex: 0,
      newOps: ops,
    });
    expect(result.status).toBe(SyncStatus.ALL_GOOD);
    expect(result.campId).toBeTruthy();
    const camp = await store.getCamp(result.campId as string);
    expect(camp).toStrictEqual({
      id: result.campId,
      name: "Camp 1",
      lists: [],
      revision: 1,
    });
    const user = await store.getUser(context.userId);
    expect(user).toStrictEqual({
      id: context.userId,
      name: "User Name",
      username: "user1",
      camps: [result.campId],
    });
  });

  it("should create a camp with lists", async () => {
    const lists = createSomeLists();
    const ops: CampOperation[] = [
      {
        ...opBoilerplate(),
        type: "CREATE_CAMP",
        name: "Camp 2",
      },
      ...createOpsFromLists(lists)
    ];
    console.log("Camp size", bson.calculateObjectSize(lists))
    console.log("Op size", ops.length, bson.calculateObjectSize(ops));
    context.userId = await store.createUser("user2", "User Name 2", "password");
    const result = await campAPI.syncCamp({
      campId: "",
      opIndex: 0,
      newOps: ops,
    });
    expect(result.status).toBe(SyncStatus.ALL_GOOD);
    expect(result.campId).toBeTruthy();
    const camp = await store.getCamp(result.campId as string);
    expect(camp).toStrictEqual({
      id: result.campId,
      name: "Camp 2",
      lists,
      revision: ops.length,
    });
    const user = await store.getUser(context.userId);
    expect(user).toStrictEqual({
      id: context.userId,
      name: "User Name 2",
      username: "user2",
      camps: [result.campId],
    });
  });

  it("update a camp", async () => {
    const ops: CampOperation[] = [
      {
        ...opBoilerplate(),
        type: "CREATE_CAMP",
        name: "Camp 3",
      },
    ];
    context.userId = await store.createUser("user3", "User Name 3", "password");
    const {campId, status} = await campAPI.syncCamp({
      campId: "",
      opIndex: 0,
      newOps: ops,
    });
    expect(status).toBe(SyncStatus.ALL_GOOD);
    expect(campId).toBeTruthy();

    const lists = createSomeLists();
    const moreOps = createOpsFromLists(lists);

    const result = await campAPI.syncCamp({
      campId: campId as string,
      opIndex: 1,
      newOps: moreOps
    })
    expect(result.status).toBe(SyncStatus.ALL_GOOD);

    const camp = await store.getCamp(campId as string);
    expect(camp).toStrictEqual({
      id: campId,
      name: "Camp 3",
      lists,
      revision: moreOps.length + 1,
    });
    const user = await store.getUser(context.userId);
    expect(user).toStrictEqual({
      id: context.userId,
      name: "User Name 3",
      username: "user3",
      camps: [campId],
    });
  })

  it("fail to update a camp", async () => {
    const firstOps: CampOperation[] = [
      {
        ...opBoilerplate(),
        type: "CREATE_CAMP",
        name: "Camp 4",
      },
    ];
    context.userId = await store.createUser("user4", "User Name 4", "password");
    const result1 = await campAPI.syncCamp({
      campId: "",
      opIndex: 0,
      newOps: firstOps,
    });
    expect(result1.status).toBe(SyncStatus.ALL_GOOD);
    expect(result1.campId).toBeTruthy();

    const secondOps = [{...opBoilerplate(), type: "RENAME_CAMP_LIST", listId: "list-1", name: "New List"}];
    const result2 = await campAPI.syncCamp({
      campId: result1.campId as string,
      opIndex: 1,
      newOps: secondOps
    })
    expect(result2.status).toBe(SyncStatus.ALL_GOOD);

    const result3 = await campAPI.syncCamp({
      campId: result1.campId as string,
      opIndex: 1,
      newOps: [{...opBoilerplate(), type: "RENAME_CAMP_LIST", listId: "list-2", name: "New List 2"}]
    })
    expect(result3.status).toBe(SyncStatus.NEED_UPDATE);
    expect(result3.updatedOps).toStrictEqual(secondOps);
  });

  it("fail to update a camp 2", async () => {
    const firstOps: CampOperation[] = [
      {
        ...opBoilerplate(),
        type: "CREATE_CAMP",
        name: "Camp 5",
      },
    ];
    context.userId = await store.createUser("user5", "User Name 5", "password");
    const result1 = await campAPI.syncCamp({
      campId: "",
      opIndex: 0,
      newOps: firstOps,
    });
    expect(result1.status).toBe(SyncStatus.ALL_GOOD);
    expect(result1.campId).toBeTruthy();

    const secondOps = [{...opBoilerplate(), type: "RENAME_CAMP_LIST", listId: "list-1", name: "New List"}];

    const result3 = await campAPI.syncCamp({
      campId: result1.campId as string,
      opIndex: 1,
      newOps: [{...opBoilerplate(), type: "RENAME_CAMP_LIST", listId: "list-2", name: "New List 2"}]
    }, async () => {
      const result2 = await campAPI.syncCamp({
        campId: result1.campId as string,
        opIndex: 1,
        newOps: secondOps
      })
      expect(result2.status).toBe(SyncStatus.ALL_GOOD);
    })

    expect(result3.status).toBe(SyncStatus.NEED_UPDATE);
    expect(result3.updatedOps).toStrictEqual(secondOps);
  });

  function opBoilerplate() {
    return { id: "opId-" + nextId++, timestamp: new Date().toJSON() };
  }

  function createSomeLists() {
    const lists = [] as List[];
    let id = 1;
    for (let i = 0; i < 13; i++) {
      lists.push({
        id: "listId-" + id,
        name: `List ${id++}`,
        items: createSomeItems()
      })
    }
    return lists;
  }

  function createSomeItems() {
    const items = [] as Item[];
    let id = 1;
    let count = Math.random() * 17;
    for (let i = 0; i < count; i++) {
      items.push({
        id: "itemId-" + id,
        name: `Item ${id++}`,
        state: randomState(),
        deleted: Math.random() < 0.5
      })
    }
    return items;
  }

  function randomState() {
    switch (Math.floor(Math.random() * 4)) {
      case 0: return ItemState.PACKEDIN;
      case 1: return ItemState.PACKEDOUT;
      case 2: return ItemState.PURCHASED;
      case 3: return ItemState.UNPURCHASED;
      default: throw Error();
    }
  }

  function createOpsFromLists(lists: List[]) {
    const ops: CampOperation[] = [];
    lists.forEach((list) => {
      ops.push({
        ...opBoilerplate(),
        type: "RENAME_CAMP_LIST",
        listId: list.id,
        name: list.name,
      });
      list.items.forEach((item) => {
        ops.push({
          ...opBoilerplate(),
          type: "RENAME_CAMP_ITEM",
          listId: list.id,
          itemId: item.id,
          name: item.name,
        });
      });
      const deletedItems = list.items
        .filter((item) => item.deleted)
        .map((item) => item.id);
      if (deletedItems.length) {
        ops.push({
          ...opBoilerplate(),
          type: "CHANGE_CAMP_ITEM_DELETED",
          listId: list.id,
          itemIds: deletedItems,
          deleted: true,
        });
      }
      for (let state of [
        ItemState.PACKEDIN,
        ItemState.PACKEDOUT,
        ItemState.PURCHASED,
        ItemState.UNPURCHASED,
      ]) {
        const items = list.items
          .filter((item) => item.state === state)
          .map((item) => item.id);
        if (items.length) {
          ops.push({
            ...opBoilerplate(),
            type: "CHANGE_CAMP_ITEM_STATE",
            listId: list.id,
            itemIds: items,
            state,
          });
        }
      }
    });
    return ops;
  }
});