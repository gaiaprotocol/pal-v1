import Token from "../../database-interface/Token.js";
import HorizontalTokenListItem from "../../token/HorizontalTokenListItem.js";
import TokenList from "../../token/TokenList.js";
import TokenService from "../../token/TokenService.js";
import PalSignedUserManager from "../PalSignedUserManager.js";

export default class UserHoldingTokensTab extends TokenList {
  private lastCreatedAt: string | undefined;

  constructor(private walletAddress: string) {
    super(".user-holding-tokens-tab", {
      storeName: walletAddress === PalSignedUserManager.user?.wallet_address
        ? "signed-user-holding-tokens"
        : undefined,
      emptyMessage: "This user does not hold any tokens.",
    });
  }

  protected addItem(token: Token): void {
    new HorizontalTokenListItem(token).appendTo(this);
  }

  protected async fetchTokens(): Promise<Token[]> {
    const tokens = await TokenService.fetchHeldTokens(
      this.walletAddress,
      this.lastCreatedAt,
    );
    this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
    return tokens;
  }
}
