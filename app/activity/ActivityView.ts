import { el, Tabs, View } from "@common-module/app";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GlobalActivityList from "./GlobalActivityList.js";
import HeldTokenActivityList from "./HeldTokenActivityList.js";

export default class ActivityView extends View {
  private tabs: Tabs;
  private globalActivityList: GlobalActivityList;
  private tokenHeldActivityList: HeldTokenActivityList | undefined;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".activity-view",
        el(
          "main",
          this.tabs = new Tabs(
            "activity-list-tabs",
            PalSignedUserManager.walletLinked
              ? [
                { id: "global", label: "Global" },
                { id: "held", label: "Held" },
              ]
              : [
                { id: "global", label: "Global" },
              ],
          ),
          this.globalActivityList = new GlobalActivityList(),
          this.tokenHeldActivityList = PalSignedUserManager.walletLinked
            ? new HeldTokenActivityList()
            : undefined,
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [this.globalActivityList, this.tokenHeldActivityList]
        .forEach((list) => list?.hide());
      if (id === "global") this.globalActivityList.show();
      else if (id === "held") this.tokenHeldActivityList?.show();
    }).init();
  }
}
