import { DomNode, el } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";
import TokenItem from "./TokenItem.js";

export default class TokenList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".token-list");
    this.append(this.list = el("ul"));
  }

  public add(tokenInfo: TokenInfo): TokenItem {
    const item = new TokenItem(tokenInfo).appendTo(this.list);
    return item;
  }

  public set activities(tokenInfos: TokenInfo[]) {
    this.list.empty();
    for (const tokenInfo of tokenInfos) {
      this.add(tokenInfo);
    }
  }
}
