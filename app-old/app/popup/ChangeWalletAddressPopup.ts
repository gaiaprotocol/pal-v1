import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-app-module";

export default class ChangeWalletAddressPopup extends Popup {
  public content: DomNode;

  constructor(walletAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".change-wallet-address-popup",
        el("h1", "Wallet Address Mismatch"),
        el(
          "main",
          el(
            "p",
            "The wallet address associated with your account and the current crypto wallet address do not match. Please change the crypto wallet address to ",
            el("b", walletAddress),
            ".",
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".confirm-button",
            click: () => this.delete(),
            title: "Confirm",
          }),
        ),
      ),
    );
  }
}
