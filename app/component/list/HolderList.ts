import { DomNode, el } from "common-dapp-module";
import TokenBalanceInfo from "../../data/TokenBalanceInfo.js";
import HolderItem from "./HolderItem.js";

export default class HolderList extends DomNode {
  private list: DomNode;

  constructor() {
    super(".holder-list");
    this.append(this.list = el("ul"));
  }

  public add(balanceInfo: TokenBalanceInfo): HolderItem {
    const item = new HolderItem(balanceInfo).appendTo(this.list);
    return item;
  }

  public set activities(balanceInfos: TokenBalanceInfo[]) {
    this.list.empty();
    for (const balanceInfo of balanceInfos) {
      this.add(balanceInfo);
    }
  }
}
