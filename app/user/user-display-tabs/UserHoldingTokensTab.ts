import Token from "../../database-interface/Token.js";
import HorizontalTokenListItem from "../../token/HorizontalTokenListItem.js";
import TokenList from "../../token/TokenList.js";

export default class UserHoldingTokensTab extends TokenList {
  constructor(storeName?: string) {
    super(".user-holding-tokens-tab", {
      storeName,
      emptyMessage: "This user does not hold any tokens.",
    });
  }

  protected addItem(token: Token): void {
    new HorizontalTokenListItem(token).appendTo(this);
  }

  protected fetchTokens(): Promise<Token[]> {
    throw new Error("Method not implemented.");
  }
}
