import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { createStore, Store } from "redux";
import rootReducer, { AppState } from "./redux/reducers/rootReducer";
import { AppActions } from "./redux/actions";
import { Provider } from "react-redux";

const store: Store<AppState, AppActions> = createStore(rootReducer);

test("renders learn react link", () => {
  const app = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const linkElement = app.getAllByText(/Create a camp/i);
  expect(linkElement.length).toBe(2);
});
