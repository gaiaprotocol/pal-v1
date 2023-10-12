import { DomNode } from "common-dapp-module";

export default class Tab extends DomNode {
  constructor(public _id: string, label: string) {
    super("li.tab");
    this.append(label);
  }

  public set active(b: boolean) {
    b ? this.addClass("active") : this.deleteClass("active");
  }
}
