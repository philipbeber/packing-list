import { Camp, CampOperation } from "desert-thing-packing-list-common";
import { SyncStatus } from "../../__generated__/globalTypes";
import { ILoginRequest, ILogout } from "./userActions";

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

export interface IServerUpdateAction {
  readonly type: "SERVER_UPDATE";
  camp: Camp;
}

export interface ISynchronizeAction {
  readonly type: "SYNCHRONIZE";
  readonly campId?: string;
}

export interface ISynchronizeResponseAction {
  readonly type: "SYNCHRONIZE_RESPONSE";
  readonly campId: string;
  readonly operationCount: number;
  readonly result: {
    status: SyncStatus;
    serverOps?: CampOperation[];
    campId?: string;
  };
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
  | IUserOperationAction
  | IOpenCampListAction
  | ICloseCampListAction
  | IChangeCampIdAction
  | IServerUpdateAction
  | ISynchronizeAction
  | ISynchronizeResponseAction
  | ILoginRequest
  | ILogout;
