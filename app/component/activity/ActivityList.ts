import { DomNode, el } from "common-dapp-module";
import Activity from "../../data/Activity.js";
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

  public set activities(activities: Activity[]) {
    this.list.empty();
    for (const activity of activities) {
      this.add(activity);
    }
  }
}
