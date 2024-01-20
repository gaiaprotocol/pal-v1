import { DomNode } from "@common-module/app";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.append();
  }

  public show() {
    this.deleteClass("hidden");
  }

  public hide() {
    this.addClass("hidden");
  }
}
