import { DomNode, el } from "@common-module/app";

export default class RoomLoading extends DomNode {
  constructor() {
    super(".room-loading");
    this.append(el("main", el(".spinner")));
  }
}
