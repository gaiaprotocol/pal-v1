import { msg } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenList from "./TokenList.js";
import TokenService from "./TokenService.js";

export default class TrendingTokenList extends TokenList {
  private lastPurchasedAt: string | undefined;

  constructor() {
    super(".trending-token-list", {
      storeName: "trending-tokens",
      emptyMessage: msg("trending-token-list-empty-message"),
    });
  }

  protected async fetchTokens(): Promise<Token[]> {
    const tokens = await TokenService.fetchTrendingTokens(this.lastPurchasedAt);
    this.lastPurchasedAt = tokens[tokens.length - 1]?.last_purchased_at;
    return tokens;
  }
}
