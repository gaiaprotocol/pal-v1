import {
  Button,
  ButtonType,
  Component,
  el,
  msg,
  Popup,
} from "@common-module/app";
import PalSignedUserManager from "./PalSignedUserManager.js";

export default class LoginRequiredPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.login-required-popup",
        el("header", el("h1", msg("login-required-title"))),
        el(
          "main",
          el("p", msg("login-required-message")),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
          new Button({
            tag: ".login",
            click: () => PalSignedUserManager.signIn(),
            title: msg("login-required-login-button"),
          }),
        ),
      ),
    );
  }
}
