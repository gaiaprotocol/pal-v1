import { DomNode, el, StringUtil } from "common-dapp-module";
import { ethers } from "ethers";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class TokenItem extends DomNode {
  private ownerProfileImage: ProfileImageDisplay;
  private ownerNameDisplay: DomNode;
  private memberCountDisplay: DomNode;

  constructor(private tokenInfo: TokenInfo) {
    super(".token-item");
    this.append(
      el(
        ".profile-image-container",
        el(
          ".profile-image",
          this.ownerProfileImage = new ProfileImageDisplay(),
        ),
      ),
      el(
        ".info-container",
        el(
          ".info",
          this.ownerNameDisplay = el("a.name"),
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

    this.ownerProfileImage.load(tokenInfo.owner);

    const ownerData = UserDetailsCacher.getCached(tokenInfo.owner);
    if (ownerData) {
      this.ownerNameDisplay.text = ownerData.display_name;
    } else {
      this.ownerNameDisplay.text = StringUtil.shortenEthereumAddress(
        tokenInfo.owner,
      );
    }

    this.loadMemberCount();
  }

  private async loadMemberCount() {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_token_balances",
    ).select("*, last_fetched_balance::text").eq(
      "token_address",
      this.tokenInfo.token_address,
    ).gte("last_fetched_balance", this.tokenInfo.view_token_required);
    if (error) {
      console.error(error);
      return;
    }
    if (!this.deleted) {
      this.memberCountDisplay.text = data.length.toString();
    }
  }
}