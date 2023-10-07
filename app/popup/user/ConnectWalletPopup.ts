import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import WalletConnectionManager from "../../user/WalletConnectionManager.js";
import WalletManager from "../../user/WalletManager.js";

export default class ConnectWalletPopup extends Popup {
  public content: DomNode;
  private connectWalletButton: Button;

  constructor(callback: () => void) {
    super({ barrierDismissible: true });
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
                'Click the "Connect Wallet" button below.',
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
              try {
                this.connectWalletButton.disable().title = "Connecting...";
                await WalletConnectionManager.connect();
                callback();
                this.delete();
              } catch (error) {
                console.error(error);
                this.connectWalletButton.enable().title = "Connect Wallet";
              }
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
