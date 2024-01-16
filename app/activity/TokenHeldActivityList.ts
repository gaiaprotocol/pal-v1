import { msg } from "@common-module/app";
import Activity from "../database-interface/Activity.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import ActivityList from "./ActivityList.js";
import ActivityService from "./ActivityService.js";

export default class TokenHeldActivityList extends ActivityList {
  constructor() {
    super(
      ".token-held-activity-list",
      {
        storeName: "token-held-activities",
        emptyMessage: msg("token-held-activity-list-empty-message"),
      },
    );
  }

  protected async fetchActivities(): Promise<Activity[]> {
    if (PalSignedUserManager.walletLinked) {
      return await ActivityService.fetchTokenHeldActivities(
        PalSignedUserManager.user!.wallet_address!,
        this.lastCreatedAt,
      );
    } else {
      return [];
    }
  }
}
