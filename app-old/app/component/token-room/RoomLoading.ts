import { DomNode, el } from "common-dapp-module";

export default class RoomLoading extends DomNode {
  constructor() {
    super(".room-loading");
    this.append(el("main", el(".spinner")));
  }
}
