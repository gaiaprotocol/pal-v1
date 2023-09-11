import { DomNode } from "common-dapp-module";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import {
  TokenCreatedActivity
} from "../../data/Activity.js";

export default class TokenCreatedActivityItem extends DomNode {
  constructor(activity: TokenCreatedActivity) {
    super(".token-created-activity-item");
    //TODO: implement
    this.append(activity.name);
    const tokenInfo = TokenInfoCacher.getCachedTokenInfo(activity.address);
    if (tokenInfo) {
      const ownerData = UserDataCacher.getCachedUserData(tokenInfo.owner);
      console.log(tokenInfo, ownerData);
    }
  }
}
