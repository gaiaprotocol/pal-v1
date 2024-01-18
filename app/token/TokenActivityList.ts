import { msg } from "@common-module/app";
import ActivityList from "../activity/ActivityList.js";
import ActivityService from "../activity/ActivityService.js";
import BlockchainType from "../blockchain/BlockchainType.js";
import Activity from "../database-interface/Activity.js";

export default class TokenActivityList extends ActivityList {
  constructor(private chain: BlockchainType, private token: string) {
    super(
      ".token-activity-list",
      { emptyMessage: msg("token-activity-list-empty-message") },
    );
  }

  protected async fetchActivities(): Promise<Activity[]> {
    return await ActivityService.fetchTokenActivities(
      this.chain,
      this.token,
      this.lastCreatedAt,
    );
  }
}
