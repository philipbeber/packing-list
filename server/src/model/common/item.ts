export enum ItemState {
  PACKEDIN = "PACKEDIN",
  PACKEDOUT = "PACKEDOUT",
  PURCHASED = "PURCHASED",
  UNPURCHASED = "UNPURCHASED",
}

export class Item {
  constructor(
    public id: string,
    public name: string,
    public state: ItemState = ItemState.UNPURCHASED,
    public deleted: boolean = false
  ) {}
}
