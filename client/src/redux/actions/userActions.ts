import { Camp, User } from "desert-thing-packing-list-common";

export interface ILoginRequest {
  readonly type: "LOGIN";
  token: string;
  user: User;
  camps: Camp[];
}

export interface ILogout {
  readonly type: "LOGOUT";
}

export interface ILeaveCampAction {
  readonly type: "LEAVE_CAMP";
}
export type UserActions = ILoginRequest | ILogout | ILeaveCampAction;
