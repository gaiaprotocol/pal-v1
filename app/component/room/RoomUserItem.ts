import { DomNode } from "common-dapp-module";
import UserDetails from "../../data/UserDetails.js";

export default class RoomUserItem extends DomNode {
  constructor(userDetails: UserDetails) {
    super(".room-user-item");
  }
}
