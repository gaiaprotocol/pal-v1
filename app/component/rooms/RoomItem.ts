import { DomNode, el, Router, StringUtil } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class RoomItem extends DomNode {
  private tokenOwnerProfileImage: ProfileImageDisplay;
  private tokenOwnerName: DomNode;

  constructor(private tokenInfo: TokenInfo) {
    super("li.room-item");
    this.append(
      this.tokenOwnerProfileImage = new ProfileImageDisplay(),
      el("span.room-name", tokenInfo.metadata.roomName ?? tokenInfo.name),
      this.tokenOwnerName = el("span.token-owner"),
    );
    this.onDom("click", () => {
      Router.go("/" + tokenInfo.token_address);
    });

    this.load();
  }

  private async load() {
    const { data, error } = await SupabaseManager.supabase.from("user_details")
      .select().eq("wallet_address", this.tokenInfo.owner);
    const tokenOwner = data?.[0];
    if (tokenOwner) {
      this.tokenOwnerProfileImage.src = tokenOwner.profile_image;
      this.tokenOwnerName.text = " by " + tokenOwner.display_name;
    } else {
      this.tokenOwnerProfileImage.src = generateJazziconDataURL(
        this.tokenInfo.owner,
      );
      this.tokenOwnerName.text = " by " + StringUtil.shortenEthereumAddress(this.tokenInfo.owner);
    }
  }
}