import { msg } from "@common-module/app";
import Token from "../database-interface/Token.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenList from "./TokenList.js";
import TokenService from "./TokenService.js";

export default class HeldTokenList extends TokenList {
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".held-token-list", {
      storeName: "held-tokens",
      emptyMessage: msg("held-token-list-empty-message"),
    });
    this.show();
  }

  protected async fetchTokens(): Promise<Token[]> {
    const walletAddress = PalSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      const tokens = await TokenService.fetchHeldOrOwnedTokens(
        walletAddress,
        this.lastCreatedAt,
      );
      this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
      return tokens;
    } else {
      return [];
    }
  }
}
