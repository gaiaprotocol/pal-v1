import { DomNode, ListLoadingBar, Store } from "@common-module/app";
import Activity from "../database-interface/Activity.js";
import ActivityListItem from "./ActivityListItem.js";

export interface ActivityListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class ActivityList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;
  protected lastCreatedAt: string | undefined;

  constructor(tag: string, options: ActivityListOptions) {
    super(tag + ".activity-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    const cachedActivities = this.store?.get<Activity[]>("cached-activities");
    if (cachedActivities && cachedActivities.length > 0) {
      for (const a of cachedActivities) {
        try {
          this.append(new ActivityListItem(a));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  protected abstract fetchActivities(): Promise<Activity[]>;

  private async refresh() {
    this.append(new ListLoadingBar());

    this.lastCreatedAt = undefined;
    const activities = await this.fetchActivities();
    this.store?.set("cached-activities", activities, true);

    if (!this.deleted) {
      this.empty();
      for (const a of activities) {
        this.append(new ActivityListItem(a));
      }
      this.lastCreatedAt = activities[activities.length - 1]?.created_at;
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
  }

  public hide() {
    this.addClass("hidden");
  }
}
