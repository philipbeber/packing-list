import React from "react";
import App from "./App";
import { createStore, Store } from "redux";
import rootReducer, { AppState } from "./redux/reducers/rootReducer";
import { AppActions } from "./redux/actions";
import { Provider } from "react-redux";
import { renderApollo } from "./test-utils";

const store: Store<AppState, AppActions> = createStore(rootReducer);

test("renders learn react link", () => {
  const app = renderApollo(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const linkElement = app.getAllByText(/Create a camp/i);
  expect(linkElement.length).toBe(2);
});
