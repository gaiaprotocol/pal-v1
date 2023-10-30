import { DomNode, el, View, ViewParams } from "common-app-module";
import TokenList, { TokenListFilter } from "../component/list/TokenList.js";
import Layout from "./Layout.js";

export default class Explorer extends View {
  private container: DomNode;

  private topTokenList: TokenList;
  //TODO: private trendingTokenList: TokenList;
  private newChatTokenList: TokenList;
  //TODO: private friendsTokenList: TokenList;
  private onlineUsersTokenList: TokenList;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".explorer-view",
        el(
          ".token-list-container",
          el("h2", "Top"),
          this.topTokenList = new TokenList(TokenListFilter.Top),
        ),
        /*el(
          ".token-list-container",
          el("h2", "Trending"),
          this.trendingTokenList = new TokenList(),
        ),*/
        el(
          ".token-list-container",
          el("h2", "New Chat"),
          this.newChatTokenList = new TokenList(TokenListFilter.NewChat),
        ),
        /*el(
          ".token-list-container",
          el("h2", "Friends"),
          this.friendsTokenList = new TokenList(),
        ),*/
        el(
          ".token-list-container",
          el("h2", "Online Users"),
          this.onlineUsersTokenList = new TokenList(TokenListFilter.OnlineUsers),
        ),
      ),
    );
  }

  public changeParams(params: ViewParams): void {
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
