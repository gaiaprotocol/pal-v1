import { DomNode } from "common-dapp-module";

export default class RoomTitleBar extends DomNode {
  constructor() {
    super(".room-title-bar");
    this.append("Chat Room");
  }
}
