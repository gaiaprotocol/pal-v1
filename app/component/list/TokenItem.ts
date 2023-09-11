import { DomNode, el, StringUtil } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import { ethers } from "ethers";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";

export default class TokenItem extends DomNode {
  private ownerProfileImage: DomNode<HTMLImageElement>;
  private ownerNameDisplay: DomNode;
  private memberCountDisplay: DomNode;

  constructor(private tokenInfo: TokenInfo) {
    super(".token-item");
    this.append(
      el(
        ".profile-image-container",
        this.ownerProfileImage = el("img.profile-image"),
      ),
      el(
        ".info-container",
        el(
          ".info",
          this.ownerNameDisplay = el("span.name"),
          "'s token ",
          el("span.name", tokenInfo.name),
          " (",
          el("span.symbol", tokenInfo.symbol),
          ").",
        ),
        el(
          ".info",
          this.memberCountDisplay = el("span.member-count"),
          " members, ",
          el("span.price", ethers.formatEther(tokenInfo.last_fetched_price)),
          " ETH",
        ),
      ),
    );

    const ownerData = UserDataCacher.getCachedUserData(tokenInfo.owner);
    if (ownerData) {
      this.ownerProfileImage.domElement.src = ownerData.profile_image;
      this.ownerNameDisplay.text = ownerData.display_name;
    } else {
      this.ownerProfileImage.domElement.src = generateJazziconDataURL(
        tokenInfo.owner,
      );
      this.ownerNameDisplay.text = StringUtil.shortenEthereumAddress(
        tokenInfo.owner,
      );
    }

    this.loadMemberCount();
  }

  private async loadMemberCount() {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_token_balances",
    ).select("wallet_address").eq(
      "token_address",
      this.tokenInfo.token_address,
    );
    if (error) {
      console.error(error);
      return;
    }
    this.memberCountDisplay.text = data.length.toString();
  }
}
