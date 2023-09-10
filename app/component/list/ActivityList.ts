import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import Activity, { eventToActivity } from "../../data/Activity.js";
import ActivityItem from "./ActivityItem.js";

export default class ActivityList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".activity-list");
    this.append(this.list = el("ul"));
  }

  public add(activity: Activity): ActivityItem {
    const item = new ActivityItem(activity).appendTo(this.list);
    return item;
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
    this.list.empty();
    if (data) {
      for (const event of data) {
        const activity = eventToActivity(event.event_type, event.args);
        this.add(activity);
      }
    }
  }
}
