import Token from "../../database-interface/Token.js";
import HorizontalTokenListItem from "../../token/HorizontalTokenListItem.js";
import TokenList from "../../token/TokenList.js";

export default class UserOwnedTokensTab extends TokenList {
  constructor(storeName?: string) {
    super(".user-owned-tokens-tab", {
      storeName,
      emptyMessage: "This user does not own any tokens.",
    });
  }

  protected addItem(token: Token): void {
    new HorizontalTokenListItem(token).appendTo(this);
  }

  protected fetchTokens(): Promise<Token[]> {
    throw new Error("Method not implemented.");
  }
}
