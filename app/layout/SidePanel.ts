import { BodyNode, DomNode, el } from "@common-module/app";

export default class SidePanel extends DomNode {
  constructor() {
    super(".side-panel");

    this.append(el("main"));

    this.onDom("click", (event: MouseEvent) => {
      if (event.target === this.domElement) {
        this.delete();
      }
    });
    BodyNode.append(this);
  }
}
