import { DomNode, el } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  private list: DomNode;

  constructor(title: string) {
    super(".room-list");
    this.append(el("header", title), this.list = el("ul"));
  }

  public add(room: TokenInfo): RoomItem {
    const item = new RoomItem(room).appendTo(this.list);
    return item;
  }

  public set rooms(rooms: TokenInfo[]) {
    this.list.empty();
    for (const room of rooms) {
      this.add(room);
    }
  }
}