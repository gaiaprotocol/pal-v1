import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";

export default class CreateTokenPopup extends Popup {
  public content: DomNode;
  private createTokenButton: Button;

  constructor(
    callback: (name: string, symbol: string, metadata: {
      description?: string;
    }) => void,
  ) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".create-token-popup",
        el("h1", "Create Token"),
        el(
          "main",
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          this.createTokenButton = new Button({
            type: ButtonType.Text,
            tag: ".create-token-button",
            click: async () => {
              //TODO:
            },
            title: "Create Token",
          }),
        ),
      ),
    );
  }
}
