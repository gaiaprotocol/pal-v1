import { DomNode, Router } from "common-dapp-module";
import TokenInfo from "../../data/TokenInfo.js";

export default class RoomItem extends DomNode {
  constructor(tokenInfo: TokenInfo) {
    super("a.room-item");
    this.append(
      tokenInfo.name,
    );
    this.onDom("click", () => {
      Router.go("/" + tokenInfo.address);
    });
  }
}
