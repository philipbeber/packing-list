import React, { Dispatch } from "react";
import { render } from "@testing-library/react";
// this adds custom jest matchers from jest-dom
import "@testing-library/jest-dom/extend-expect";
import { createMockClient, MockedProvider, MockedResponse, MockLink } from "@apollo/client/testing";
import { AnyAction, applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer, { AppState } from "./redux/reducers/rootReducer";
import thunkMiddleware from 'redux-thunk'
import { log } from "desert-thing-packing-list-common";
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

type TestClientOptions = {
  mocks?: MockedResponse[];
  addTypename?: any;
  defaultOptions?: any;
  cache?: any;
  resolvers?: any;
};

type RenderApolloOptions = {
  mocks?: MockedResponse[];
  addTypename?: any;
  defaultOptions?: any;
  cache?: any;
  resolvers?: any;
  [st: string]: any;
};

function logger({ getState }: { getState: () => AppState}) {
  return (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    log.info('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    log.log('state after dispatch', JSON.stringify(getState()))

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

export const createTestStore = (initialState?: AppState) => {
  return createStore(rootReducer, initialState, applyMiddleware(logger, thunkMiddleware));
}

export const createTestClient = ({
  mocks,
  addTypename,
  defaultOptions,
  cache,
  resolvers,
}: TestClientOptions = {}) => {
  const client = new ApolloClient<NormalizedCacheObject>({
    cache: cache || new InMemoryCache({ addTypename: addTypename }),
    defaultOptions,
    link: new MockLink(mocks || [], addTypename),
    resolvers: resolvers,
  });
  return client;
};

const renderApollo = (
  node: any,
  {
    mocks,
    addTypename,
    defaultOptions,
    cache,
    resolvers,
    store = createStore(rootReducer, undefined, applyMiddleware(logger)),
    ...options
  }: RenderApolloOptions = {}
) => {
  return render(
    <MockedProvider
      mocks={mocks}
      addTypename={addTypename}
      defaultOptions={defaultOptions}
      cache={cache}
      resolvers={resolvers}
    >
      <Provider store={store}>{node}</Provider>
    </MockedProvider>,
    options
  );
};

export * from "@testing-library/react";
export { renderApollo };
