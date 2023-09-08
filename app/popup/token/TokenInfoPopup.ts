import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
  Router,
} from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../../contract/PalContract.js";
import TokenInfo from "../../data/TokenInfo.js";

export default class TokenInfoPopup extends Popup {
  public content: DomNode;

  constructor(private info: TokenInfo) {
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
            tag: ".chat-room-button",
            click: () => {
              Router.go("/" + this.info.token_address);
              this.delete();
            },
            title: "Chat Room",
          }),
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
    const price = await PalContract.getBuyPriceAfterFee(
      this.info.token_address,
      ethers.parseEther("1"),
    );
    this.content.append(
      el(
        "section",
        el("label", "Price"),
        el("p", ethers.formatEther(price) + " ETH"),
      ),
    );
  }
}
