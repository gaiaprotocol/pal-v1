import { DomNode } from "@common-module/app";
import Token from "../database-interface/Token.js";

export default class HorizontalTokenListItem extends DomNode {
  constructor(token: Token) {
    super(".horizontal-token-list-item");
  }
}
