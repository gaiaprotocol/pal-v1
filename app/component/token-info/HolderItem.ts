import { DomNode } from "common-dapp-module";
import TokenBalanceInfo from "../../data/TokenBalanceInfo.js";

export default class HolderItem extends DomNode {
  constructor(balanceInfo: TokenBalanceInfo) {
    super(".holder-item");
  }
}
