import { Camp } from "desert-thing-packing-list-common";
import { CampManager } from "../../model/campManager";
import { ILoginRequest, ILogout } from "./userActions";
export interface IOpenCampAction {
  readonly type: "OPEN_CAMP";
  payload: string;
}

export interface ICloseCampAction {
  readonly type: "CLOSE_CAMP";
}

export interface ICreateCampAction {
  readonly type: "CREATE_CAMP";
  readonly cm: CampManager;
}

export interface IUserOperationAction {
  readonly type: "UPDATE_CAMP";
  readonly cm: CampManager;
}

export interface IServerUpdateAction {
  readonly type: "SERVER_UPDATE";
  camp: Camp;
}

export interface ISynchronizeAction {
  readonly type: "SYNCHRONIZE_START";
  readonly campId: string;
}

export interface ISynchronizeResponseAction {
  readonly type: "SYNCHRONIZE_RESPONSE";
  readonly campId: string;
  readonly cm: CampManager;
}

export interface IChangeCampIdAction {
  readonly type: "CHANGE_CAMP_ID";
  oldCampId: string;
  newCampId: string;
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

export type CampActions =
  | IOpenCampAction
  | ICloseCampAction
  | ICreateCampAction
  | IUserOperationAction
  | IOpenCampListAction
  | ICloseCampListAction
  | IChangeCampIdAction
  | IServerUpdateAction
  | ISynchronizeAction
  | ISynchronizeResponseAction
  | ILoginRequest
  | ILogout;
