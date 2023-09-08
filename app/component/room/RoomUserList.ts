import { DomNode, el } from "common-dapp-module";
import UserDetails from "../../data/UserDetails.js";
import RoomUserItem from "./RoomUserItem.js";

export default class RoomUserList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".room-user-list");
    this.append(this.list = el("ul"));
  }

  public add(userDetails: UserDetails): RoomUserItem {
    const item = new RoomUserItem(userDetails).appendTo(this.list);
    return item;
  }

  public set activities(userDetailsSet: UserDetails[]) {
    this.list.empty();
    for (const userDetails of userDetailsSet) {
      this.add(userDetails);
    }
  }
}
