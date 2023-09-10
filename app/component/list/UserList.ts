import { DomNode, el } from "common-dapp-module";
import UserDetails from "../../data/UserDetails.js";
import UserItem from "./UserItem.js";

export default class UserList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".user-list");
    this.append(this.list = el("ul"));
  }

  public add(userDetails: UserDetails): UserItem {
    const item = new UserItem(userDetails).appendTo(this.list);
    return item;
  }

  public set users(userDetailsSet: UserDetails[]) {
    this.list.empty();
    for (const userDetails of userDetailsSet) {
      this.add(userDetails);
    }
  }
}
