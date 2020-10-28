export interface ICreateCampAction {
  readonly type: "CREATE_CAMP";
  payload: {
    id: string;
    name: string;
  };
}
export interface ILeaveCampAction {
  readonly type: "LEAVE_CAMP";
}
export type UserActions = ICreateCampAction | ILeaveCampAction;
