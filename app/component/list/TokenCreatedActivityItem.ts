import { DomNode, el, Router, StringUtil } from "common-dapp-module";
import dayjs from "dayjs";
import BlockTimeCacher from "../../cacher/BlockTimeCacher.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import { TokenCreatedActivity } from "../../data/Activity.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class TokenCreatedActivityItem extends DomNode {
  private ownerProfileImage: ProfileImageDisplay;
  private ownerNameDisplay: DomNode;
  private nameDisplay: DomNode;
  private symbolDisplay: DomNode;
  private timeDisplay: DomNode;

  constructor(activity: TokenCreatedActivity) {
    super(".token-created-activity-item");
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
          " created a token ",
          this.nameDisplay = el("a.name", {
            click: () => Router.go("/" + activity.address),
          }),
          " (",
          this.symbolDisplay = el("a.symbol", {
            click: () => Router.go("/" + activity.address),
          }),
          ").",
        ),
        el(
          ".info",
          this.timeDisplay = el("span.time"),
        ),
      ),
    );

    this.ownerProfileImage.load(activity.owner);

    const ownerData = UserDetailsCacher.getCached(activity.owner);
    if (ownerData) {
      this.ownerNameDisplay.text = ownerData.display_name;
    } else {
      this.ownerNameDisplay.text = StringUtil.shortenEthereumAddress(
        activity.owner,
      );
    }

    this.nameDisplay.text = activity.name;
    this.symbolDisplay.text = activity.symbol;
    this.timeDisplay.text = dayjs(
      BlockTimeCacher.blockToTime(activity.blockNumber),
    ).fromNow();
  }
}
