import { DomNode } from "common-dapp-module";
import Activity, { EventType } from "../../data/Activity.js";

export default class ActivityItem extends DomNode {
  constructor(activity: Activity) {
    super(".activity-item");
    if (activity.eventType === EventType.TokenCreated) {
      //TODO: implement
      this.append(activity.name);
    } else if (activity.eventType === EventType.Trade) {
      //TODO: implement
      this.append(activity.token);
    }
  }
}
