import { ItemState } from "./item";

export interface CampOperationBase {
  readonly id: string;
  readonly timestamp: string;
  //readonly userId: number;
}

export interface IdentityOperation extends CampOperationBase {
  readonly type: "IDENTITY";
}

export interface CreateCampOperation extends CampOperationBase {
  readonly type: "CREATE_CAMP";
  readonly name: string;
}

export interface ListOperation extends CampOperationBase {
  readonly listId: string;
}

export interface CreateCampListOperation extends ListOperation {
  readonly type: "CREATE_CAMP_LIST";
  readonly name: string;
}

export interface CreateCampItemOperation extends ListOperation {
  readonly type: "CREATE_CAMP_ITEM";
  readonly itemId: string;
  readonly name: string;
}

export interface ChangeCampItemStateOperation extends ListOperation {
  readonly type: "CHANGE_CAMP_ITEM_STATE";
  itemIds: string[];
  state: ItemState;
}

export interface ChangeCampItemDeletedOperation extends ListOperation {
  readonly type: "CHANGE_CAMP_ITEM_DELETED";
  itemIds: string[];
  deleted: boolean;
}

export type CampOperation =
  | IdentityOperation
  | CreateCampOperation
  | CreateCampListOperation
  | CreateCampItemOperation
  | ChangeCampItemStateOperation
  | ChangeCampItemDeletedOperation;
