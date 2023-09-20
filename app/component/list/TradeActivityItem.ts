import { DomNode, el, StringUtil } from "common-dapp-module";
import dayjs from "dayjs";
import { ethers } from "ethers";
import BlockTimeCacher from "../../cacher/BlockTimeCacher.js";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import { TradeActivity } from "../../data/Activity.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class TradeActivityItem extends DomNode {
  private traderProfileImage: ProfileImageDisplay;
  private ownerProfileImage: ProfileImageDisplay;
  private traderNameDisplay: DomNode;
  private ownerNameDisplay: DomNode;
  private amountDisplay: DomNode;
  private symbolDisplay: DomNode;
  private priceDisplay: DomNode;
  private timeDisplay: DomNode;

  constructor(activity: TradeActivity) {
    super(".trade-activity-item");
    this.append(
      el(
        ".profile-image-container",
        el(
          ".profile-image",
          this.traderProfileImage = new ProfileImageDisplay(),
        ),
        el(
          ".profile-image",
          this.ownerProfileImage = new ProfileImageDisplay(),
        ),
      ),
      el(
        ".info-container",
        el(
          ".info",
          this.traderNameDisplay = el("a.name"),
          activity.isBuy ? " bought " : " sold ",
          this.amountDisplay = el("span.amount"),
          " ",
          this.ownerNameDisplay = el("a.name"),
          "'s ",
          this.symbolDisplay = el("span.symbol"),
        ),
        el(
          ".info",
          this.priceDisplay = el(
            "span.price" +
              (activity.isBuy ? ".up" : ".down"),
          ),
          ", ",
          this.timeDisplay = el("span.time"),
        ),
      ),
    );

    this.amountDisplay.text = ethers.formatEther(activity.amount);
    this.priceDisplay.text = ethers.formatEther(activity.price) + " ETH";
    this.timeDisplay.text = dayjs(
      BlockTimeCacher.blockToTime(activity.blockNumber),
    ).fromNow();

    this.traderProfileImage.load(activity.trader);

    const traderData = UserDetailsCacher.getCached(activity.trader);
    if (traderData) {
      this.traderNameDisplay.text = traderData.display_name;
    } else {
      this.traderNameDisplay.text = StringUtil.shortenEthereumAddress(
        activity.trader,
      );
    }

    const tokenInfo = TokenInfoCacher.getCached(activity.token);
    if (tokenInfo) {
      this.symbolDisplay.text = tokenInfo.symbol;

      this.ownerProfileImage.load(tokenInfo.owner);

      const ownerData = UserDetailsCacher.getCached(tokenInfo.owner);
      if (ownerData) {
        this.ownerNameDisplay.text = ownerData.display_name;
      } else {
        this.ownerNameDisplay.text = StringUtil.shortenEthereumAddress(
          tokenInfo.owner,
        );
      }
    }
  }
}
