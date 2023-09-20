import { DomNode, el, Router, StringUtil } from "common-dapp-module";
import dayjs from "dayjs";
import { ethers } from "ethers";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class RoomItem extends DomNode {
  private tokenOwnerProfileImage: ProfileImageDisplay;
  private tokenOwnerName: DomNode;

  constructor(public tokenInfo: TokenInfo) {
    super("li.room-item");
    this.append(
      this.tokenOwnerProfileImage = new ProfileImageDisplay({ noClick: true }),
      el(
        ".info",
        el(
          ".room-info",
          el("span.room-name", tokenInfo.metadata.roomName ?? tokenInfo.name),
          this.tokenOwnerName = el("span.token-owner"),
          el(
            "span.price" +
              (tokenInfo.is_price_up === undefined ||
                  tokenInfo.is_price_up === null
                ? ""
                : (tokenInfo.is_price_up ? ".up" : ".down")),
            ethers.formatEther(tokenInfo.last_fetched_price) + " ETH",
          ),
        ),
        el(
          ".last-message",
          el("span.message", tokenInfo.last_message ?? ""),
          el(
            "span.time",
            !tokenInfo.last_message_sent_at
              ? ""
              : dayjs(tokenInfo.last_message_sent_at).fromNow(),
          ),
        ),
      ),
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
