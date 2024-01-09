import Token from "../database-interface/Token.js";
import TokenList from "./TokenList.js";

export default class OwnedTokenList extends TokenList {
  constructor() {
    super(".owned-token-list", {
      storeName: "owned-tokens",
      emptyMessage: "You don't own any tokens yet.",
    });
  }

  protected fetchTokens(): Promise<Token[]> {
    throw new Error("Method not implemented.");
  }
}
