import { el, msg, Tabs, View } from "@common-module/app";
import Layout from "../layout/Layout.js";
import NewTokenList from "../token/NewTokenList.js";
import TopTokenList from "../token/TopTokenList.js";
import TrendingTokenList from "../token/TrendingTokenList.js";

export default class ExploreView extends View {
  private tabs: Tabs;
  private trendingTokenList: TrendingTokenList;
  private topTokenList: TopTokenList;
  private newTokenList: NewTokenList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".explore-view",
        el(
          "main",
          this.tabs = new Tabs("explore", [{
            id: "trending",
            label: msg("explore-view-trending-tab"),
          }, {
            id: "top",
            label: msg("explore-view-top-tab"),
          }, {
            id: "new",
            label: msg("explore-view-new-tab"),
          }]),
          this.trendingTokenList = new TrendingTokenList(),
          this.topTokenList = new TopTokenList(),
          this.newTokenList = new NewTokenList(),
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.trendingTokenList,
        this.topTokenList,
        this.newTokenList,
      ].forEach((list) => list.hide());
      if (id === "trending") this.trendingTokenList.show();
      else if (id === "top") this.topTokenList.show();
      else if (id === "new") this.newTokenList.show();
    }).init();
  }
}
