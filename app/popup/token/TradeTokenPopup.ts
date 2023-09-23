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
import WalletManager from "../../user/WalletManager.js";
import BuyTokenPopup from "./BuyTokenPopup.js";
import SellTokenPopup from "./SellTokenPopup.js";

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
              const popup = new BuyTokenPopup(tokenAddress);
              popup.on("buyToken", () => this.fireEvent("buyToken"));
            },
          }),
          new Button({
            title: "Sell Token",
            click: async () => {
              if (!WalletManager.connected) {
                await WalletManager.connect();
              }
              const popup = new SellTokenPopup(tokenAddress);
              popup.on("sellToken", () => this.fireEvent("sellToken"));
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
