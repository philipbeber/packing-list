import * as _ from "lodash";
import { createStore, Store } from "redux";
import rootReducer, { AppState } from "../reducers/rootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";
import { AppActions } from "../actions";
const version = "0.2";
interface FrozenState {
  version: string;
  state: AppState;
}

const store: Store<AppState, AppActions> = createStore(
  rootReducer,
  loadState(),
  devToolsEnhancer({})
);
export default store;

store.subscribe(
  _.throttle(() => {
    try {
      const frozeState: FrozenState = {
        version,
        state: store.getState(),
      };
      const serializedState = JSON.stringify(frozeState);
      localStorage.setItem("state", serializedState);
    } catch {
      // ignore write errors
    }
  }, 1000)
);

function loadState() {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState) {
      const frozeState = JSON.parse(serializedState) as FrozenState;
      if (frozeState.version === version) {
        return frozeState.state;
      }
    }
  } catch (err) {
    console.warn(err);
  }
  return undefined;
}
