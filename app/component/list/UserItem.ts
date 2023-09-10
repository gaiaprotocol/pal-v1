import { DomNode } from "common-dapp-module";
import UserDetails from "../../data/UserDetails.js";

export default class UserItem extends DomNode {
  constructor(userDetails: UserDetails) {
    super(".user-item");
  }
}
