import { msg } from "@common-module/app";
import { SocialUserPublic } from "@common-module/social";
import PalUserService from "../user/PalUserService.js";
import UserList from "../user/user-list/UserList.js";

export default class TokenHolderList extends UserList {
  private lastCreatedAt: string | undefined;

  constructor(private token: string) {
    super(".token-holder-list", {
      emptyMessage: msg("token-holder-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SocialUserPublic[]> {
    const holders = await PalUserService.fetchTokenHolders(
      this.token,
      this.lastCreatedAt,
    );
    this.lastCreatedAt = holders[holders.length - 1]?.created_at;
    return holders;
  }
}
