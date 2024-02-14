import { Button, DomNode, el, MaterialIcon, msg } from "@common-module/app";
import PalSignedUserManager from "./PalSignedUserManager.js";

export default class LoginRequiredDisplay extends DomNode {
  constructor() {
    super(".login-required");
    this.append(
      new MaterialIcon("lock"),
      el(
        "main",
        el("p", msg("login-required-message")),
        new Button({
          title: msg("login-required-login-button"),
          click: () => PalSignedUserManager.signIn(),
        }),
      ),
    );
  }
}
