import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../../contract/PalContract.js";
import BuyTokenPopup from "./BuyTokenPopup.js";
import SellTokenPopup from "./SellTokenPopup.js";
import WalletManager from "../../user/WalletManager.js";

export default class TradeTokenPopup extends Popup {
  public content: DomNode;
  private priceDisplay: DomNode;

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".trade-token-popup",
        el("h1", "Trade Token"),
        el(
          "main",
          this.priceDisplay = el("p"),
          new Button({
            title: "Buy Token",
            click: async () => {
              if (!WalletManager.connected) {
                await WalletManager.connect();
              }
              new BuyTokenPopup(tokenAddress);
            },
          }),
          new Button({
            title: "Sell Token",
            click: async () => {
              if (!WalletManager.connected) {
                await WalletManager.connect();
              }
              new SellTokenPopup(tokenAddress);
            },
          }),
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
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPrice(
      this.tokenAddress,
      ethers.parseEther("1"),
    );
    this.priceDisplay.appendText(`${ethers.formatEther(price)} ETH`);
  }
}
