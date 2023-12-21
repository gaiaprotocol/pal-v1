import {
  BodyNode,
  DomNode,
  el,
  Icon,
  NavBar,
  View,
  ViewParams,
} from "common-app-module";
import TitleBar from "./TitleBar.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  private navBar: NavBar;
  private titleBar: TitleBar;
  private content: DomNode;

  constructor(params: ViewParams, uri: string) {
    super();
    Layout.current = this;

    BodyNode.append(
      this.container = el(
        ".layout",
        this.navBar = new NavBar({
          logo: el("img", { src: "/images/logo-transparent.png" }),
          menu: [
            {
              id: "posts",
              icon: new Icon("post"),
              title: "Posts",
              uri: "/posts",
            },
            {
              id: "chats",
              icon: new Icon("chat"),
              title: "Chats",
              uri: "/chats",
            },
            {
              id: "activity",
              icon: new Icon("activity"),
              title: "Activity",
              uri: "/activity",
            },
            {
              id: "explore",
              icon: new Icon("explore"),
              title: "Explore",
              uri: "/explore",
            },
          ],
        }),
        el(
          "main",
          this.titleBar = new TitleBar(),
          this.content = el("section.content"),
        ),
      ),
    );

    this.changeUri(uri);
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.changeUri(uri);
  }

  private changeUri(uri: string): void {
    this.navBar.active(
      uri === "" ? "posts" : uri.substring(
        0,
        uri.indexOf("/") === -1 ? uri.length : uri.indexOf("/"),
      ),
    );
    this.titleBar.changeTitle(uri);
  }
}
