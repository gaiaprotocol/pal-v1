import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";

export default class TokenInfoPopup extends Popup {
  public content: DomNode;

  constructor(info: TokenInfo) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".token-info-popup",
        el("h1", "Token Info"),
        el(
          "main",
          el("label", "Name"),
          el("p", info.name),
          el("label", "Symbol"),
          el("p", info.symbol),
          el("label", "Description"),
          el("p", info.metadata.description),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
        ),
      ),
    );
  }
}
