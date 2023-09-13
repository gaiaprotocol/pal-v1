import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import Activity, { eventToActivity, EventType } from "../../data/Activity.js";
import TokenCreatedActivityItem from "./TokenCreatedActivityItem.js";
import TradeActivityItem from "./TradeActivityItem.js";

export default class ActivityList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".activity-list");
    this.append(this.list = el("ul"));
  }

  public add(activity: Activity): TokenCreatedActivityItem | TradeActivityItem {
    if (activity.eventType === EventType.TokenCreated) {
      const item = new TokenCreatedActivityItem(activity).appendTo(this.list);
      return item;
    } else if (activity.eventType === EventType.Trade) {
      const item = new TradeActivityItem(activity).appendTo(this.list);
      return item;
    } else {
      throw new Error("Unknown event type");
    }
  }

  public async load(filter: {
    walletAddresses?: string[];
    tokenAddresses?: string[];
  }) {
    const select = SupabaseManager.supabase.from(
      "pal_contract_events",
    ).select("*");
    if (filter.walletAddresses) {
      select.in("wallet_address", filter.walletAddresses);
    }
    if (filter.tokenAddresses) {
      select.in("token_address", filter.tokenAddresses);
    }
    const { data, error } = await select.order("block_number", {
      ascending: false,
    });
    if (error) {
      throw error;
    }
    this.list.empty();
    if (data) {
      const activityList: Activity[] = [];
      const tokenAddresses = new Set<string>();
      const walletAddresses = new Set<string>();

      for (const event of data) {
        const activity = eventToActivity(
          event.event_type,
          event.block_number,
          event.args,
        );
        if (activity.eventType === EventType.TokenCreated) {
          tokenAddresses.add(activity.address);
          walletAddresses.add(activity.owner);
        } else if (activity.eventType === EventType.Trade) {
          tokenAddresses.add(activity.token);
          walletAddresses.add(activity.trader);
        }
        activityList.push(activity);
      }

      const tokenInfoSet = await TokenInfoCacher.getMultipleTokenInfo(
        Array.from(tokenAddresses),
      );
      for (const tokenInfo of tokenInfoSet) {
        walletAddresses.add(tokenInfo.owner);
      }
      await UserDataCacher.getMultipleUserData(Array.from(walletAddresses));

      for (const activity of activityList) {
        this.add(activity);
      }
    }
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
