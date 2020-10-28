import { Item } from "./item";

export class List {
  constructor(
    public id: string,
    public name: string,
    public items: Item[] = []
  ) {}
}
