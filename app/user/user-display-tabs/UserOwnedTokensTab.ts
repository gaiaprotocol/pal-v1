import Token from "../../database-interface/Token.js";
import HorizontalTokenListItem from "../../token/HorizontalTokenListItem.js";
import TokenList from "../../token/TokenList.js";
import PalSignedUserManager from "../PalSignedUserManager.js";

export default class UserOwnedTokensTab extends TokenList {
  constructor(userId: string) {
    super(".user-owned-tokens-tab", {
      storeName: userId === PalSignedUserManager.user?.user_id
        ? "signed-user-owned-tokens"
        : undefined,
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
