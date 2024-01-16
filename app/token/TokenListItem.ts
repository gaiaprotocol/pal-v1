import { DomNode } from "@common-module/app";
import Token from "../database-interface/Token.js";

export default class TokenListItem extends DomNode {
  constructor(token: Token) {
    super(".token-list-item");
    this.append(token.name);
  }
}
