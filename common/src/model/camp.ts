import { CampOperation } from "./campOperations";
import { Item } from "./item";
import { List } from "./list";

export interface Camp {
  readonly id: string;
  readonly name: string;
  readonly lists: List[];
  readonly revision: number;
}

export function applyOperationsToCamp<C extends Camp>(
  camp: C,
  operations: CampOperation[]
): C {
  operations.forEach(op => {
    camp = applyOperationToCamp(camp, op);
  });
  return camp;
}

export function applyOperationToCamp<C extends Camp>(
  camp: C,
  operation: CampOperation
): C {
  switch (operation.type) {
    case "CREATE_CAMP_LIST": {
      return {
        ...camp,
        lists: [...camp.lists, new List(operation.listId, operation.name)],
      };
    }
    case "CREATE_CAMP_ITEM": {
      const list = camp.lists.find((l) => l.id === operation.listId);
      if (!list) {
        return camp;
      }
      const newList = new List(list.id, list.name, [
        ...list.items,
        new Item(operation.itemId, operation.name),
      ]);
      return {
        ...camp,
        lists: camp.lists.map((l) => (l === list ? newList : l))
      };
    }
    case "CHANGE_CAMP_ITEM_STATE": {
      const pl = operation;
      return transformItems(camp, pl.listId, pl.itemIds, (item) =>
        item.state !== pl.state
          ? new Item(item.id, item.name, pl.state, item.deleted)
          : item
      );
    }
    case "CHANGE_CAMP_ITEM_DELETED": {
      const pl = operation;
      return transformItems(camp, pl.listId, pl.itemIds, (item) =>
        item.deleted !== pl.deleted
          ? new Item(item.id, item.name, item.state, pl.deleted)
          : item
      );
    }
    default: {
      throw Error("Unknown operation " + JSON.stringify(operation));
    }
  }
}

function transformItems<C extends Camp>(
  camp: C,
  listId: string,
  itemIds: string[],
  transform: (item: Item) => Item
): C {
  const list = camp?.lists.find((l) => l.id === listId);
  if (!list) {
    return camp;
  }
  let changed = false;
  const newItems = list.items.map((item) => {
    if (itemIds.indexOf(item.id) >= 0) {
      const newItem = transform(item);
      if (item !== newItem) {
        changed = true;
        return newItem;
      }
      return item;
    }
    return item;
  });
  if (!changed) {
    return camp;
  }
  const newList = new List(list.id, list.name, newItems);
  return {
    ...camp,
    lists: camp.lists.map((l) => (l === list ? newList : l))
  };
}
