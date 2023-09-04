import { DomNode } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  constructor(title: string) {
    super(".room-list");
  }

  public add(room: TokenInfo): RoomItem {
    const item = new RoomItem(room).appendTo(this);
    return item;
  }

  public set rooms(rooms: TokenInfo[]) {
    this.empty();
    for (const room of rooms) {
      this.add(room);
    }
  }
}
