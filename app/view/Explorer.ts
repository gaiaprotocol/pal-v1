import { DomNode, el, View, ViewParams } from "common-dapp-module";
import TokenList from "../component/list/TokenList.js";
import Layout from "./Layout.js";

export default class Explorer extends View {
  private container: DomNode;

  private tokenList: TokenList;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".explorer-view",
        // Top
        this.tokenList = new TokenList(),
        //TODO: Trending

        // New Chats

        // Friends

        // Online
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
