import { DomNode, el, StringUtil } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import dayjs from "dayjs";
import { ethers } from "ethers";
import BlockTimeCacher from "../../cacher/BlockTimeCacher.js";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import { TradeActivity } from "../../data/Activity.js";

export default class TradeActivityItem extends DomNode {
  private traderProfileImage: DomNode<HTMLImageElement>;
  private ownerProfileImage: DomNode<HTMLImageElement>;
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
        this.traderProfileImage = el("img.profile-image"),
        this.ownerProfileImage = el("img.profile-image"),
      ),
      el(
        ".info-container",
        el(
          ".info",
          this.traderNameDisplay = el("span.name"),
          activity.isBuy ? " bought " : " sold ",
          this.amountDisplay = el("span.amount"),
          " ",
          this.ownerNameDisplay = el("span.name"),
          "'s ",
          this.symbolDisplay = el("span.symbol"),
        ),
        el(
          ".info",
          this.priceDisplay = el("span.price"),
          " ETH, ",
          this.timeDisplay = el("span.time"),
        ),
      ),
    );

    this.amountDisplay.text = ethers.formatEther(activity.amount);
    this.priceDisplay.text = ethers.formatEther(activity.price);
    this.timeDisplay.text = dayjs(
      BlockTimeCacher.blockToTime(activity.blockNumber),
    ).fromNow();

    const traderData = UserDataCacher.getCachedUserData(activity.trader);
    if (traderData) {
      this.traderProfileImage.domElement.src = traderData.profile_image;
      this.traderNameDisplay.text = traderData.display_name;
    } else {
      this.traderProfileImage.domElement.src = generateJazziconDataURL(
        activity.trader,
      );
      this.traderNameDisplay.text = StringUtil.shortenEthereumAddress(
        activity.trader,
      );
    }

    const tokenInfo = TokenInfoCacher.getCachedTokenInfo(activity.token);
    if (tokenInfo) {
      this.symbolDisplay.text = tokenInfo.symbol;

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
    }
  }
}
