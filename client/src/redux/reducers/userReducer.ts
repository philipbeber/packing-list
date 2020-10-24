import { UserActions } from "../actions/userActions";

type UserState = {};
const initialState: UserState = {};
const userReducer = (state: UserState = initialState, action: UserActions) => {
  switch (action.type) {
    default:
      return state;
  }
};
export default userReducer;
