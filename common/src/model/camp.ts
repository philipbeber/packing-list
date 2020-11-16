import { CampOperation, ChangeCampItemDeletedOperation, ChangeCampItemStateOperation } from "./campOperations";
import { Item } from "./item";
import { List } from "./list";

export interface Camp {
  readonly id: string;
  readonly name: string;
  readonly lists: List[];
  readonly revision: number;
}

export function applyOperationsToCamp(camp: Camp, operations: CampOperation[]): Camp {
  operations.forEach((op) => {
    camp = applyOperationToCamp(camp, op);
  });
  return camp;
}

export function applyOperationToCamp(camp: Camp, operation: CampOperation): Camp {
  switch (operation.type) {
    case "RENAME_CAMP_LIST": {
      return modifyList(camp, operation.listId, list => ({
        ...list,
        name: operation.name
      }));
    }
    case "RENAME_CAMP_ITEM": {
      return modifyItems(camp, operation.listId, [operation.itemId], item => ({
        ...item,
        name: operation.name
      }));
    }
    case "CHANGE_CAMP_ITEM_STATE": {
      return modifyItems(camp, operation.listId, operation.itemIds, item => ({
        ...item,
        state: operation.state
      }));
    }
    case "CHANGE_CAMP_ITEM_DELETED": {
      return modifyItems(camp, operation.listId, operation.itemIds, item => ({
        ...item,
        deleted: operation.deleted
      }));
    }
    default: {
      throw Error("Unknown operation " + JSON.stringify(operation));
    }
  }
}

// Finds or creates a list with the given id, modifies it, returns a new camp with the
// modified list
function modifyList(camp: Camp, listId: string, modifier: (list: List) => List): Camp {
  let create = true;
  const newLists = camp.lists.map((list) => {
    if (list.id === listId) {
      create = false;
      return modifier(list);
    } else {
      return list;
    }
  });
  if (create) {
    // Create new list if id not found
    newLists.push(modifier(new List(listId, "<ghost>")));
  }
  return {
    ...camp,
    lists: newLists,
  };
}

// Return a new camp with a modified list. The list will have the items with the given ids modified
// by calling the callback
function modifyItems(camp: Camp, listId: string, itemIds: string[], modifier: (item: Item) => Item): Camp {
  return modifyList(camp, listId, list => {
    const itemIdsLeft = itemIds.slice();
    const newItems = list.items.map(item => {
      const index = itemIdsLeft.indexOf(item.id);
      if (index >= 0) {
        itemIdsLeft.splice(index, 1);
        return modifier(item);
      } else {
        return item;
      }
    });
    // Create new items for any ids not found
    newItems.push(...itemIdsLeft.map(itemId => modifier(new Item(itemId, "<ghost>"))));
    return {
      ...list,
      items: newItems
    }
  });
}

export function transformOps(
  clientOps: CampOperation[],
  serverOps: CampOperation[]
): CampOperation[] {
  let newOps = clientOps;
  let changed = false;
  serverOps.forEach((serverOp) => {
    for (let index = 0; index < newOps.length; index++) {
      const clientOp = newOps[index];
      const [newClientOp, newServerOp] = transformOp(clientOp, serverOp);
      if (newClientOp !== clientOp) {
        if (!changed) {
          newOps = newOps.slice(0);
          changed = true;
        }
        if (newClientOp.type === "IDENTITY") {
          newOps.splice(index, 1);
          index--;
        } else {
          newOps[index] = newClientOp;
        }
      }
      if (newServerOp.type === "IDENTITY") {
        break;
      }
      serverOp = newServerOp;
    }
  });
  return newOps;
}

function transformOp(
  clientOp: CampOperation,
  serverOp: CampOperation
): [CampOperation, CampOperation] {
  if (clientOp.timestamp > serverOp.timestamp) {
    // For now only simple operations are supported, so earlier ones will always be overwritten
    return [clientOp, { ...serverOp, type: "IDENTITY" }];
  }
  if (clientOp.type !== serverOp.type) {
    return [clientOp, serverOp];
  }
  switch (clientOp.type) {
    case "RENAME_CAMP_LIST":
    case "RENAME_CAMP_ITEM":
      return [clientOp, serverOp];
    case "CHANGE_CAMP_ITEM_DELETED":
    case "CHANGE_CAMP_ITEM_STATE":
      return transformListOp(
        clientOp,
        serverOp as
          | ChangeCampItemStateOperation
          | ChangeCampItemDeletedOperation
      );
    default:
      throw Error("Illegal client op type: " + clientOp.type);
  }
}

// Client op happened before server op but will appear after it in the list, therefore just remove
// any item ids that appear in the server operation.
function transformListOp(
  clientOp: ChangeCampItemStateOperation | ChangeCampItemDeletedOperation,
  serverOp: ChangeCampItemStateOperation | ChangeCampItemDeletedOperation
): [CampOperation, CampOperation] {
  if (clientOp.listId !== serverOp.listId) {
    return [clientOp, serverOp];
  }
  const newItemIds = clientOp.itemIds.filter(
    (id) => serverOp.itemIds.indexOf(id) < 0
  );
  if (newItemIds.length === clientOp.itemIds.length) {
    return [clientOp, serverOp];
  }
  if (newItemIds.length === 0) {
    return [{ ...clientOp, type: "IDENTITY" }, serverOp];
  }
  const newClientOp = {
    ...clientOp,
    itemIds: newItemIds,
  };
  return [newClientOp, serverOp];
}
