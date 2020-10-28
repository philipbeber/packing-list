import {
  Camp,
  CampOperationBase,
  CampOperation,
  Item,
  ItemState,
  List,
} from "desert-thing-packing-list-common";

export interface IOpenCampAction {
  readonly type: "OPEN_CAMP";
  payload: string;
}

export interface ICloseCampAction {
  readonly type: "CLOSE_CAMP";
}

export interface IUserOperationAction {
  readonly type: "USER_OPERATION";
  campId: string;
  op: CampOperation;
}

export interface IOpenCampListAction {
  readonly type: "OPEN_CAMP_LIST";
  payload: {
    campId: string;
    listId: string;
  };
}

export interface ICloseCampListAction {
  readonly type: "CLOSE_CAMP_LIST";
}

export interface IClearCampDataAction {
  readonly type: "CLEAR_CAMP_DATA";
}

export type CampActions =
  | IOpenCampAction
  | ICloseCampAction
  | IUserOperationAction
  | IOpenCampListAction
  | ICloseCampListAction
  | IClearCampDataAction;
