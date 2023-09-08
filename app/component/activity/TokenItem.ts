import { DomNode } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";

export default class TokenItem extends DomNode {
  constructor(tokenInfo: TokenInfo) {
    super(".token-item");
  }
}
