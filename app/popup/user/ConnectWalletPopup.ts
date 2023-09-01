import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import WalletManager from "../../auth/WalletManager.js";
import WalletConnectionManager from "../../auth/WalletConnectionManager.js";

export default class ConnectWalletPopup extends Popup {
  public content: DomNode;
  private connectWalletButton: Button;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".connect-wallet-popup",
        el("h1", "Connect Wallet to Pal"),
        el(
          "main",
          el(
            "p",
            "To connect wallet to Pal, please follow the steps below:",
            el(
              "ol",
              el(
                "li",
                "Connect with your crypto wallet.\n\n",
                el("w3m-core-button"),
              ),
              el(
                "li",
                'Click the "Connect Wallet" button.',
              ),
            ),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          this.connectWalletButton = new Button({
            type: ButtonType.Text,
            tag: ".connect-wallet-button",
            click: async () => {
              await WalletConnectionManager.connect();
            },
            title: "Connect Wallet",
          }),
        ),
      ),
    );

    WalletManager.connected
      ? this.connectWalletButton.enable()
      : this.connectWalletButton.disable();
    this.onDelegate(WalletManager, "accountChanged", () => {
      WalletManager.connected
        ? this.connectWalletButton.enable()
        : this.connectWalletButton.disable();
    });
  }
}
