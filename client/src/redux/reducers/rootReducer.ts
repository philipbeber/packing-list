import { combineReducers } from "redux";
import userReducer from "./userReducer";
import campReducer from "./campReducer";
const rootReducer = combineReducers({
  user: userReducer,
  camp: campReducer,
});
export type AppState = ReturnType<typeof rootReducer>;
export default rootReducer;
