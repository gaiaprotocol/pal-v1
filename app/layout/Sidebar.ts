import { DomNode } from "@common-module/app";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.append();
  }
}
