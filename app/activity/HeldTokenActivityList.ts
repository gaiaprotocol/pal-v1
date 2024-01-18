import { msg } from "@common-module/app";
import Activity from "../database-interface/Activity.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import ActivityService from "./ActivityService.js";
import { ActivityList } from "../index.js";

export default class HeldTokenActivityList extends ActivityList {
  constructor() {
    super(
      ".held-token-activity-list",
      {
        storeName: "held-token-activities",
        emptyMessage: msg("held-token-activity-list-empty-message"),
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
