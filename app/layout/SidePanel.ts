import { BodyNode, Button, DomNode, el } from "@common-module/app";
import CreateTokenPopup from "../token/CreateTokenPopup.js";

export default class SidePanel extends DomNode {
  constructor() {
    super(".side-panel");

    this.append(el(
      "main",
      new Button({
        title: "New Token",
        click: () => {
          new CreateTokenPopup();
          this.delete();
        },
      }),
    ));

    this.onDom("click", (event: MouseEvent) => {
      if (event.target === this.domElement) {
        this.delete();
      }
    });
    BodyNode.append(this);
  }
}
