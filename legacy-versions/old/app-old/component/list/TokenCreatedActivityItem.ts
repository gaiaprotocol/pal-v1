import { DomNode, el, ErrorAlert, StringUtil } from "@common-module/app";
import dayjs from "dayjs";
import BlockTimeCacher from "../../cacher/BlockTimeCacher.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import { TokenCreatedActivity } from "../../data/Activity.js";
import TokenInfoPopup from "../../popup/token/TokenInfoPopup.js";
import UserInfoPopup from "../../popup/user/UserInfoPopup.js";
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
            click: () => new TokenInfoPopup(activity.address),
          }),
          " (",
          this.symbolDisplay = el("a.symbol", {
            click: () => new TokenInfoPopup(activity.address),
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
      this.ownerNameDisplay.onDom(
        "click",
        () => new UserInfoPopup(ownerData),
      );
    } else {
      this.ownerNameDisplay.text = StringUtil.shortenEthereumAddress(
        activity.owner,
      );
      this.ownerNameDisplay.onDom(
        "click",
        () => new ErrorAlert({ title: "Error", message: "User not found" }),
      );
    }

    this.nameDisplay.text = activity.name;
    this.symbolDisplay.text = activity.symbol;
    this.timeDisplay.text = dayjs(
      BlockTimeCacher.blockToTime(activity.blockNumber),
    ).fromNow();
  }
}
