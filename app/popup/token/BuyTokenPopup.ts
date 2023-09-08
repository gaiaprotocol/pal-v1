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

export default class BuyTokenPopup extends Popup {
  public content: DomNode;
  private priceDisplay: DomNode;

  private currentPrice: bigint = 0n;

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".buy-token-popup",
        el("h1", "Buy Token"),
        el(
          "main",
          this.priceDisplay = el("p"),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          new Button({
            type: ButtonType.Text,
            tag: ".buy-token-button",
            click: async () => {
              await PalContract.buyToken(
                this.tokenAddress,
                ethers.parseEther("1"),
                this.currentPrice,
              );
              this.delete();
            },
            title: "Buy Token",
          }),
        ),
      ),
    );
    this.loadPrice();
  }

  private async loadPrice() {
    this.currentPrice = await PalContract.getBuyPriceAfterFee(
      this.tokenAddress,
      ethers.parseEther("1"),
    );
    this.priceDisplay.appendText(
      `${ethers.formatEther(this.currentPrice)} ETH`,
    );
  }
}
