export enum ItemState {
  Unpurchased,
  Purchased,
  PackedIn,
  PackedOut,
}

export class Item {
  constructor(
    public id: string,
    public name: string,
    public state: ItemState = ItemState.Unpurchased,
    public deleted: boolean = false
  ) {}
}
