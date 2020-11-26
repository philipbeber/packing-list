import React from 'react';

import {
  renderApollo,
  cleanup,
  fireEvent,
  createTestStore,
} from '../../test-utils';
import HomePage from '../homePage';
import { SYNCHRONIZE } from '../../apollo';
import { CampOperation } from 'desert-thing-packing-list-common';
import { SyncStatus } from '../../__generated__/globalTypes';
import { setDebounceFunction } from '../../util/debounce';
import { resetLazySynchronizeMap } from '../../model/campManager';

describe('Home Page', () => {

  // automatically unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  test('renders login page', async () => {
    const {getByTestId} = await renderApollo(<HomePage />);

    fireEvent.click(getByTestId('menu-open'));
    fireEvent.click(getByTestId('open-login'));
    expect(getByTestId('email-box')).toBeInTheDocument();
  });

  test('fires sync mutation and updates store after done', async () => {

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

    setDebounceFunction((
      func: (...args: any) => any    ) => {
      console.log("deb1");
      return ((...args: []) => {
        console.log("deb2")
        setTimeout(() => {
          console.log("deb3");
          func.apply(undefined, args)
        })
      }) as any;
    });
    resetLazySynchronizeMap();

    const store = createTestStore({
      user: {
        token: "tok123",
        info: { id: "u1234", name: "Freda", username: "a@a.xom" },
      },
      camp: {
        campManagers: [
          {
            campId: "camp1",
            current: {
              id: "camp1",
              name: "Hello Camp",
              revision: 1,
              lists: [],
            },
            lastServerOperation: 0,
            operations,
            synchronizing: false,
          },
        ],
        selectedCampId: "camp1",
      },
    });

    const {getByTestId} = renderApollo(<HomePage />, {
      mocks,
      store,
      addTypename: false
    });

    fireEvent.click(getByTestId('menu-open'));
    fireEvent.click(getByTestId('sync-button'));

    await new Promise((resolve) => setTimeout(resolve, 1));

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
