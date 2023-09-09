import { DomNode, el } from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../contract/PalContract.js";
import TokenInfo from "../data/TokenInfo.js";
import TokenInfoPopup from "../popup/token/TokenInfoPopup.js";
import UserManager from "../user/UserManager.js";

export default class TokenSummary extends DomNode {
  constructor(private tokenInfo: TokenInfo) {
    super(".token-summary.loading");
    this.onDom("click", () => new TokenInfoPopup(this.tokenInfo));
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPriceAfterFee(
      UserManager.userToken!.token_address,
      ethers.parseEther("1"),
    );

    this.append(
      el("img.profile-image", {
        src: UserManager.user?.user_metadata.avatar_url,
      }),
      el("span.symbol", this.tokenInfo.symbol),
      el("span.price", `${ethers.formatEther(price)} ETH`),
    );

    this.deleteClass("loading");
  }
}
