import * as _ from "lodash";
import { applyMiddleware, createStore, Store } from "redux";
import rootReducer, { AppState } from "../reducers/rootReducer";
import { composeWithDevTools } from "redux-devtools-extension";
import { AppActions } from "../actions";
import { resetCampManager } from "../../model/campManager";
import thunkMiddleware from 'redux-thunk'

const version = "0.3";
const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

interface FrozenState {
  version: string;
  state: AppState;
}

const store: Store<AppState, AppActions> = createStore(
  rootReducer,
  loadState(),
  composedEnhancer
);
export default store;

store.subscribe(
  _.throttle(() => {
    try {
      const frozenState: FrozenState = {
        version,
        state: store.getState(),
      };
      const serializedState = JSON.stringify(frozenState);
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
      const frozenState = JSON.parse(serializedState) as FrozenState;
      if (frozenState.version === version) {
        frozenState.state.camp.campManagers = frozenState.state.camp.campManagers.map(resetCampManager);
        return frozenState.state;
      }
    }
  } catch (err) {
    console.warn(err);
  }
  return undefined;
}
