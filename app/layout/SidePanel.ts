import {
  BodyNode,
  Button,
  DomNode,
  el,
  MaterialIcon,
  Router,
} from "@common-module/app";
import CreateTokenPopup from "../token/CreateTokenPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

export default class SidePanel extends DomNode {
  constructor() {
    super(".side-panel");

    this.append(el(
      "main",
      el("section.profile"),
      el(
        "ul.menu",
        el("li", el("a", "Profile")),
        el(
          "li",
          el("a", "Settings", {
            click: () => Router.go("/settings"),
          }),
        ),
        el(
          "li",
          el("a", "Logout", {
            click: () => PalSignedUserManager.signOut(),
          }),
        ),
      ),
      el(
        "section.tokens",
        el(
          "header",
          el("h3", "Tokens"),
          new Button({
            icon: new MaterialIcon("add"),
            click: () => {
              new CreateTokenPopup();
              this.delete();
            },
          }),
        ),
      ),
    ));

    this.onDom("click", (event: MouseEvent) => {
      if (event.target === this.domElement) {
        this.delete();
      }
    });
    BodyNode.append(this);
  }
}
