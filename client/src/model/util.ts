import * as uuid from "short-uuid";
import {
  CampOperationBase,
  ChangeCampItemDeletedOperation,
  ChangeCampItemStateOperation,
  CreateCampItemOperation,
  CreateCampListOperation,
  CreateCampOperation,
  ListOperation,
} from "desert-thing-packing-list-common";
import { ItemState } from "desert-thing-packing-list-common";

function generateId() {
  return uuid.generate();
}

function createOperation(): CampOperationBase {
  return {
    id: generateId(),
    timestamp: new Date().toJSON()
  };
}

function createListOperation(listId: string): ListOperation {
  return {
    ...createOperation(),
    listId,
  };
}

export function createCamp(name: string): {campId: string, op: CreateCampOperation} {
  return {
    campId: generateId(),
    op: {
      ...createOperation(),
      type: "CREATE_CAMP",
      name,
    },
  };
}

export function createList(
  name: string
): CreateCampListOperation {
  return {
    ...createListOperation(generateId()),
    type: "CREATE_CAMP_LIST",
    name,
  };
}

export function createItem(
  listId: string,
  name: string
): CreateCampItemOperation {
  return {
    ...createListOperation(listId),
    type: "CREATE_CAMP_ITEM",
    itemId: generateId(),
    name,
  };
}

export function changeItemState(
  listId: string,
  itemIds: string[],
  state: ItemState
): ChangeCampItemStateOperation {
  return {
    ...createListOperation(listId),
    type: "CHANGE_CAMP_ITEM_STATE",
    itemIds,
    state,
  };
}

export function changeItemDeleted(
  listId: string,
  itemIds: string[],
  deleted: boolean
): ChangeCampItemDeletedOperation {
  return {
    ...createListOperation(listId),
    type: "CHANGE_CAMP_ITEM_DELETED",
    itemIds,
    deleted,
  };
}
