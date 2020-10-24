import { ItemState } from "./item";

export interface CampOperation {
  readonly id: string;
  readonly timestamp: number;
  readonly campId: string;
  //readonly userId: number;
}

export interface IdentityOperation extends CampOperation {
  readonly type: "IDENTITY";
}

export interface CreateCampOperation extends CampOperation {
  readonly type: "CREATE_CAMP";
  readonly name: string;
}

export interface ListOperation extends CampOperation {
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

export type CampOperations =
  | IdentityOperation
  | CreateCampOperation
  | CreateCampListOperation
  | CreateCampItemOperation
  | ChangeCampItemStateOperation
  | ChangeCampItemDeletedOperation;
