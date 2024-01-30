import {
  BodyNode,
  DomNode,
  el,
  MaterialIcon,
  msg,
  NavBar,
  View,
  ViewParams,
} from "@common-module/app";
import Sidebar from "./Sidebar.js";
import TitleBar from "./TitleBar.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  public static changeTitle(title: string): void {
    Layout.current.titleBar.title = title;
  }

  private navBar: NavBar;
  private titleBar: TitleBar;
  private content: DomNode;
  private sidebar: Sidebar;

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
              icon: new MaterialIcon("post"),
              title: msg("nav-bar-menu-posts"),
              uri: "/posts",
            },
            {
              id: "chats",
              icon: new MaterialIcon("chat"),
              title: msg("nav-bar-menu-chats"),
              uri: "/chats",
            },
            {
              id: "activity",
              icon: new MaterialIcon("browse_activity"),
              title: msg("nav-bar-menu-activity"),
              uri: "/activity",
            },
            {
              id: "explore",
              icon: new MaterialIcon("explore"),
              title: msg("nav-bar-menu-explore"),
              uri: "/explore",
            },
          ],
        }),
        el(
          "main",
          this.titleBar = new TitleBar(),
          this.content = el("section.content"),
          this.sidebar = new Sidebar(),
        ),
      ),
    );

    this.changeUri(uri);
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.changeUri(uri);
  }

  private changeUri(uri: string): void {
    if (uri === "") uri = "posts";
    if (uri === "general" || uri.indexOf("/0x") !== -1) uri = "chats";

    uri = uri.substring(
      0,
      uri.indexOf("/") === -1 ? uri.length : uri.indexOf("/"),
    );

    uri === "chats" || uri === "general" || uri.indexOf("/0x") !== -1
      ? this.sidebar.hide()
      : this.sidebar.show();

    this.navBar.active(uri);
    this.titleBar.uri = uri;
  }
}
