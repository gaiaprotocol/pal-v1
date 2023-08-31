import {
  BodyNode,
  DomNode,
  el,
  Router,
  View,
  ViewParams,
} from "common-dapp-module";
import Icon from "../component/Icon.js";
import UserSummary from "../component/UserSummary.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  private container: DomNode;
  private content: DomNode;
  private navButtons: { [uri: string]: DomNode } = {};

  constructor(params: ViewParams, uri: string) {
    super();
    Layout.current = this;

    BodyNode.append(
      this.container = el(
        ".layout",
        el(
          "header",
          el(
            "a.logo",
            el("img", { src: "/images/logo.png" }, {
              click: () => Router.go("/"),
            }),
          ),
          new UserSummary(),
        ),
        this.content = el("main"),
        el(
          "nav",
          this.navButtons[""] = el("a", new Icon("chat"), "Rooms", {
            click: () => Router.go("/"),
          }),
          this.navButtons["activity"] = el(
            "a",
            new Icon("browse_activity"),
            "Activity",
            {
              click: () => Router.go("/activity"),
            },
          ),
          this.navButtons["settings"] = el(
            "a",
            new Icon("settings"),
            "Settings",
            {
              click: () => Router.go("/settings"),
            },
          ),
        ),
      ),
    );
    this.activeNavButton(uri);
  }

  private activeNavButton(uri: string): void {
    for (const _uri in this.navButtons) {
      if (_uri === uri) {
        this.navButtons[_uri].addClass("active");
      } else {
        this.navButtons[_uri].deleteClass("active");
      }
    }
    if (!this.navButtons[uri]) {
      this.navButtons[""].addClass("active");
    }
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.activeNavButton(uri);
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
