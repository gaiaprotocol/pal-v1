import { DomNode } from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../contract/PalContract.js";
import TokenInfo from "../data/TokenInfo.js";
import TokenInfoPopup from "../popup/token/TokenInfoPopup.js";
import UserManager from "../user/UserManager.js";

export default class TokenSummary extends DomNode {
  constructor(private tokenInfo: TokenInfo) {
    super(".token-summary");
    this.onDom("click", () => new TokenInfoPopup(this.tokenInfo));
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPriceAfterFee(
      UserManager.userToken!.address,
      ethers.parseEther("1"),
    );

    this.append(
      `1 ${this.tokenInfo.symbol} = ${ethers.formatEther(price)} ETH`,
    );
  }
}
