import { DomNode, el, View, ViewParams } from "common-dapp-module";
import ActivityList from "../component/list/ActivityList.js";
import TokenList from "../component/activity/TokenList.js";
import { eventToActivity } from "../data/Activity.js";
import SupabaseManager from "../SupabaseManager.js";
import Layout from "./Layout.js";

export default class ActivityView extends View {
  private container: DomNode;

  private activityList: ActivityList;
  private tokenList: TokenList;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".activity-view",
        this.activityList = new ActivityList(),
        this.tokenList = new TokenList(),
      ),
    );
    this.loadActivities();
  }

  public changeParams(params: ViewParams): void {
  }

  private async loadActivities(): Promise<void> {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_contract_events",
    ).select("*").order("block_number", { ascending: false });
    console.log(data, error);
    if (data) {
      const activities = [];
      for (const event of data) {
        const activity = eventToActivity(event.event_type, event.args);
        activities.push(activity);
      }
      this.activityList.activities = activities;
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
