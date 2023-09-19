import { DomNode, el, Router, StringUtil } from "common-dapp-module";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
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
    this.tokenOwnerProfileImage.load(this.tokenInfo.owner);

    const tokenOwner = await UserDetailsCacher.get(this.tokenInfo.owner);
    if (tokenOwner) {
      this.tokenOwnerName.text = " by " + tokenOwner.display_name;
    } else {
      this.tokenOwnerName.text = " by " +
        StringUtil.shortenEthereumAddress(this.tokenInfo.owner);
    }
  }
}
