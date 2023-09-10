import { DomNode, el, View, ViewParams } from "common-dapp-module";
import TokenList from "../component/list/TokenList.js";
import Layout from "./Layout.js";

export default class Explorer extends View {
  private container: DomNode;

  private topTokenList: TokenList;
  //TODO: private trendingTokenList: TokenList;
  private newChatTokenList: TokenList;
  //TODO: private friendsTokenList: TokenList;
  private onlineUserTokenList: TokenList;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".explorer-view",
        // Top
        this.topTokenList = new TokenList(),
        //TODO: Trending

        // New Chat
        this.newChatTokenList = new TokenList(),
        //TODO: Friends

        // Online User
        this.onlineUserTokenList = new TokenList(),
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
