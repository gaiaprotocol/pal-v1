import { DomNode } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";

export default class RoomItem extends DomNode {
  constructor(tokenInfo: TokenInfo) {
    super(".room-item");
  }
}
