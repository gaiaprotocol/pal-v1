import { DomNode, el } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import { ethers } from "ethers";
import SupabaseManager from "../SupabaseManager.js";
import PalContract from "../contract/PalContract.js";
import TokenInfo from "../data/TokenInfo.js";
import TokenInfoPopup from "../popup/token/TokenInfoPopup.js";

export default class TokenSummary extends DomNode {
  constructor(private tokenInfo: TokenInfo) {
    super(".token-summary.loading");
    this.onDom("click", () => new TokenInfoPopup(this.tokenInfo));
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPriceAfterFee(
      this.tokenInfo.token_address,
      ethers.parseEther("1"),
    );

    const { data, error } = await SupabaseManager.supabase.from("user_details")
      .select().eq("wallet_address", this.tokenInfo.owner);

    const tokenOwner = data?.[0];
    let profileImageSrc;
    if (tokenOwner) {
      profileImageSrc = tokenOwner.profile_image;
    } else {
      profileImageSrc = generateJazziconDataURL(
        this.tokenInfo.owner,
      );
    }

    this.append(
      el("img.profile-image", {
        src: profileImageSrc,
      }),
      el("span.symbol", this.tokenInfo.symbol),
      el("span.price", `${ethers.formatEther(price)} ETH`),
    );

    this.deleteClass("loading");
  }
}
