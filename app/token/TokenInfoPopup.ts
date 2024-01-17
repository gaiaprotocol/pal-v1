import {
  Button,
  ButtonType,
  Component,
  el,
  msg,
  Popup,
} from "@common-module/app";

export default class TokenInfoPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".token-info-popup.popup",
        el("header", el("h1")),
        el(
          "main",
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            title: msg("cancel-button"),
            click: () => this.delete(),
          }),
        ),
      ),
    );
  }
}
