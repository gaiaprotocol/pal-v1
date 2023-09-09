import { DomNode, el } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";
import ListLoading from "../ListLoading.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  private list: DomNode;
  private loadingComponent: ListLoading | undefined;

  constructor(title: string) {
    super(".room-list");
    this.append(
      el("header", title),
      this.list = el("ul", this.loadingComponent = new ListLoading()),
    );
    this.loadingComponent.on("delete", () => this.loadingComponent = undefined);
  }

  public add(room: TokenInfo): RoomItem {
    const item = new RoomItem(room).appendTo(this.list);
    this.loadingComponent?.delete();
    return item;
  }

  public set rooms(rooms: TokenInfo[]) {
    this.list.empty();
    for (const room of rooms) {
      this.add(room);
    }
  }
}
