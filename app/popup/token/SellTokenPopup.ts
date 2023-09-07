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

export default class SellTokenPopup extends Popup {
  public content: DomNode;
  private priceDisplay: DomNode;

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".sell-token-popup",
        el("h1", "Sell Token"),
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
        ),
      ),
    );
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getSellPriceAfterFee(
      this.tokenAddress,
      ethers.parseEther("1"),
    );
    this.priceDisplay.appendText(`${ethers.formatEther(price)} ETH`);
  }
}
