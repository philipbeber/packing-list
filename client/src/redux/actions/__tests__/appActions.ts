import { createTestStore, createTestClient } from "../../../test-utils";
import { SYNCHRONIZE } from '../../../apollo';
import { CampOperation } from 'desert-thing-packing-list-common';
import { SyncStatus } from '../../../__generated__/globalTypes';
import { log } from "desert-thing-packing-list-common";
import { userOperationAction } from '../appActions';

describe('App actions', () => {

  beforeAll(() => log.setLevel(log.levels.DEBUG));

  jest.useFakeTimers()

  test('creates camp', async () => {

    const operations: CampOperation[] = [
      {
        type: "CREATE_CAMP",
        id: "op123",
        name: "Hello Camp",
        timestamp: new Date().toJSON(),
      },
    ];

    const mocks = [
      {
        request: {
          query: SYNCHRONIZE,
          variables: {
            campId: "camp1",
            opIndex: 0,
            lastOp: undefined,
            newOps: operations,
          },
        },
        result: {
          data: {
            synchronize: {
              status: SyncStatus.ALL_GOOD,
              updatedOps: [],
              campId: "camp2",
            },
          },
        },
      },
    ];

    const store = createTestStore({
      user: {
        token: "tok123",
        info: { id: "u1234", name: "Freda", username: "a@a.xom" },
      },
      camp: {
        campManagers: [],
      },
    });

    const client = createTestClient({ mocks, addTypename: false });

    userOperationAction(client, "camp1", operations[0])(store.dispatch, store.getState);

    jest.advanceTimersByTime(10000);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    expect(store.getState()).toEqual({
      user: {
        token: "tok123",
        info: { id: "u1234", name: "Freda", username: "a@a.xom" },
      },
      camp: {
        campManagers: [
          {
            campId: "camp2",
            current: {
              id: "camp2",
              name: "Hello Camp",
              revision: 1,
              lists: [],
            },
            lastServerOperation: 1,
            operations: [],
            synchronizing: false,
            server: { id: "camp2", name: "Hello Camp", revision: 1, lists: [] },
          },
        ],
        selectedCampId: "camp2",
      },
    });
  });

});
