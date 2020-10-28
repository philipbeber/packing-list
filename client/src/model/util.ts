import * as uuid from "short-uuid";
import { Camp } from "./camp";
import {
  CampOperationBase,
  ChangeCampItemDeletedOperation,
  ChangeCampItemStateOperation,
  CreateCampItemOperation,
  CreateCampListOperation,
  CreateCampOperation,
  ListOperation,
} from "./campOperations";
import { ItemState } from "./item";

export class User {
  constructor(public name: string, public camps: Camp[] = []) {}
}

function generateId() {
  return uuid.generate();
}

function createOperation(campId: string): CampOperationBase {
  return {
    id: generateId(),
    timestamp: Date.now(),
    campId,
  };
}

function createListOperation(campId: string, listId: string): ListOperation {
  return {
    ...createOperation(campId),
    listId,
  };
}

export function createCamp(name: string): CreateCampOperation {
  return {
    ...createOperation(generateId()),
    type: "CREATE_CAMP",
    name,
  };
}

export function createList(
  campId: string,
  name: string
): CreateCampListOperation {
  return {
    ...createListOperation(campId, generateId()),
    type: "CREATE_CAMP_LIST",
    name,
  };
}

export function createItem(
  campId: string,
  listId: string,
  name: string
): CreateCampItemOperation {
  return {
    ...createListOperation(campId, listId),
    type: "CREATE_CAMP_ITEM",
    itemId: generateId(),
    name,
  };
}

export function changeItemState(
  campId: string,
  listId: string,
  itemIds: string[],
  state: ItemState
): ChangeCampItemStateOperation {
  return {
    ...createListOperation(campId, listId),
    type: "CHANGE_CAMP_ITEM_STATE",
    itemIds,
    state,
  };
}

export function changeItemDeleted(
  campId: string,
  listId: string,
  itemIds: string[],
  deleted: boolean
): ChangeCampItemDeletedOperation {
  return {
    ...createListOperation(campId, listId),
    type: "CHANGE_CAMP_ITEM_DELETED",
    itemIds,
    deleted,
  };
}
