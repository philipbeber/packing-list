import { User } from "desert-thing-packing-list-common";
import { UserActions } from "../actions/userActions";

type UserState = {
  token?: string,
  info?: User,
  isLoggingIn?: boolean,
};
const initialState: UserState = {};
const userReducer = (
  state: UserState = initialState,
  action: UserActions
): UserState => {
  switch (action.type) {
    case "LOGIN": {
      return {
        token: action.token,
        info: {
          id: action.user.id,
          username: action.user.name,
          name: action.user.name,
        },
      };
    }
    case "LOGOUT": {
      return {
        token: undefined,
        info: undefined
      }
    }
    default:
      return state;
  }
};
export default userReducer;
