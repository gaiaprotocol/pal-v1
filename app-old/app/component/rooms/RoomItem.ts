import { Constants, DomNode, el, Router, StringUtil } from "common-app-module";
import dayjs from "dayjs";
import { ethers } from "ethers";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class RoomItem extends DomNode {
  private roomNameDisplay: DomNode;
  private priceDisplay: DomNode;
  private lastMessageDisplay: DomNode;
  private lastMessageSentAtDisplay: DomNode;

  private tokenOwnerProfileImage: ProfileImageDisplay;
  private tokenOwnerName: DomNode;

  public currentTokenAddress: string;

  constructor(tokenInfo: TokenInfo) {
    super("li.room-item");

    this.currentTokenAddress = tokenInfo.token_address;
    this.append(
      this.tokenOwnerProfileImage = new ProfileImageDisplay({ noClick: true }),
      el(
        ".info",
        el(
          ".room-info",
          this.roomNameDisplay = el("span.room-name"),
          this.tokenOwnerName = el("span.token-owner"),
          this.priceDisplay = el("span.price"),
        ),
        el(
          ".last-message",
          this.lastMessageDisplay = el("span.message"),
          this.lastMessageSentAtDisplay = el("span.time"),
        ),
      ),
    );
    this.onDom("click", () => {
      Router.go("/" + tokenInfo.token_address);
    });

    this.load(tokenInfo);
  }

  public async load(tokenInfo: TokenInfo) {
    this.currentTokenAddress = tokenInfo.token_address;

    this.roomNameDisplay.text = tokenInfo.metadata.roomName ?? tokenInfo.name;
    if (
      tokenInfo.is_price_up === undefined ||
      tokenInfo.is_price_up === null
    ) {
      this.priceDisplay.deleteClass("up");
      this.priceDisplay.deleteClass("down");
    } else {
      this.priceDisplay.addClass(tokenInfo.is_price_up ? "up" : "down");
    }
    this.priceDisplay.text = ethers.formatEther(tokenInfo.last_fetched_price) +
      " ETH";
    this.lastMessageDisplay.text = tokenInfo.last_message ?? "";
    this.lastMessageSentAtDisplay.text =
      tokenInfo.last_message_sent_at === Constants.NEGATIVE_INFINITY
        ? ""
        : dayjs(tokenInfo.last_message_sent_at).fromNow();

    this.tokenOwnerProfileImage.load(tokenInfo.owner);

    const tokenOwner = await UserDetailsCacher.get(tokenInfo.owner);
    if (tokenOwner) {
      this.tokenOwnerName.text = " by " + tokenOwner.display_name;
    } else {
      this.tokenOwnerName.text = " by " +
        StringUtil.shortenEthereumAddress(tokenInfo.owner);
    }
  }
}
