import { DomNode } from "common-dapp-module";
import Activity from "../../data/Activity.js";

export default class ActivityItem extends DomNode {
  constructor(activity: Activity) {
    super(".activity-item");
  }
}
