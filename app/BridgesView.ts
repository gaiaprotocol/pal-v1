import { el, MaterialIcon, View } from "@common-module/app";
import Layout from "./layout/Layout.js";

export default class BridgesView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".bridges-view",
        el(
          "a.bridge",
          el(
            "header",
            { style: { backgroundColor: "#0153ff" } },
            el("img.logo", { src: "/images/chain/base.svg" }),
            new MaterialIcon("arrow_outward"),
          ),
          el("h2", "Base Bridge"),
          el("a.url", "https://bridge.base.org/deposit"),
          {
            href: "https://bridge.base.org/deposit",
            target: "_blank",
          },
        ),
      ),
    );
  }
}
