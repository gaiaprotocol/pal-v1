import { DomNode, el, View, ViewParams } from "common-dapp-module";
import ActivityList from "../component/list/ActivityList.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";
import Constants from "../Constants.js";

export default class ActivityView extends View {
  private container: DomNode;

  private globalActivityList: ActivityList;
  private yoursActivityList: ActivityList;
  private yourTokensActivityList: ActivityList;
  //TODO: private friendsActivityList: ActivityList;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".activity-view",
        el(
          ".activity-list-container",
          el("h2", "Global"),
          this.globalActivityList = new ActivityList(),
        ),
        el(
          ".activity-list-container",
          el("h2", "Yours"),
          this.yoursActivityList = new ActivityList(),
        ),
        el(
          ".activity-list-container",
          el("h2", "Your Tokens"),
          this.yourTokensActivityList = new ActivityList(),
        ),
        /*el(
          ".activity-list-container",
          el("h2", "Friends"),
          this.friendsActivityList = new ActivityList(),
        ),*/
      ),
    );

    this.globalActivityList.load({});
    if (UserManager.userWalletAddress) {
      this.yoursActivityList.load({
        walletAddresses: [UserManager.userWalletAddress],
      });
      this.loadTokens();
    }
  }

  private async loadTokens(): Promise<void> {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_tokens",
    ).select(Constants.PAL_TOKENS_SELECT_QUERY).eq(
      "owner",
      UserManager.userWalletAddress,
    );
    if (data) {
      const tokenAddresses = [];
      for (const token of data as any) {
        tokenAddresses.push(token.token_address);
      }
      this.yourTokensActivityList.load({
        tokenAddresses,
      });
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
