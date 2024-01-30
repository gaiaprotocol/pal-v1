import { Button, ButtonType, DomNode, el, Router } from "@common-module/app";
import TopTokenList from "../token/TopTokenList.js";
import TrendingTokenList from "../token/TrendingTokenList.js";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.append(
      el(
        "section.trending-tokens",
        el("header", el("h2", "Trending Tokens")),
        new TrendingTokenList(9).show(),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            title: "Show More",
            click: () => Router.go("/explore/trending"),
          }),
        ),
      ),
      el(
        "section.top-tokens",
        el("header", el("h2", "Top Tokens")),
        new TopTokenList(3).show(),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            title: "Show More",
            click: () => Router.go("/explore/top"),
          }),
        ),
      ),
    );
  }

  public show() {
    this.deleteClass("hidden");
  }

  public hide() {
    this.addClass("hidden");
  }
}
