import React from 'react';

import {
  renderApollo,
  cleanup,
  fireEvent,
  createTestStore,
} from '../../test-utils';
import Login from '../login';
import { LOGIN_USER } from '../../apollo';
import { act } from '@testing-library/react';

describe('Login Component', () => {
  // automatically unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  test('renders login component', async () => {
      const {getByTestId} = renderApollo(<Login onClose={() => undefined} open={true}/>);
      expect(getByTestId("email-box")).toBeInTheDocument();
  });

  test('fires login mutation and updates store after done', async () => {

    const mocks = [
      {
        request: { query: LOGIN_USER, variables: { email: "a@a.a", password: "shhhh" } },
        result: {
          data: {
            login: {
              token: "def456",
              user: {
                  id: "123",
                  username: "fred@fred.com",
                  name: "Fred"
              },
              camps: []
            },
          },
        },
      },
    ];

    const store = createTestStore();

    let onDialogClosed: () => void = undefined as any;
    const closed = new Promise<void>((resolve) => {
        onDialogClosed = resolve;
    });
    const {getByTestId} = renderApollo(<Login onClose={onDialogClosed} open={true}/>, {
      mocks,
      store
    });

    fireEvent.change(getByTestId("email-box").querySelector('input') as Element, {
      target: { value: "a@a.a" },
    });
    fireEvent.change(getByTestId("password-box").querySelector('input') as Element, {
      target: { value: "shhhh" },
    });
    fireEvent.click(getByTestId('login-button'));

    await act(() => closed);

    const state = store.getState();
    expect(state.user).toStrictEqual({
      token: "def456",
      info: {
        id: "123",
        username: "fred@fred.com",
        name: "Fred",
      },
    });
  });
});
