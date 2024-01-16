import { msg } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenList from "./TokenList.js";
import TokenService from "./TokenService.js";

export default class TopTokenList extends TokenList {
  private lastRank: number | undefined;

  constructor() {
    super(".top-token-list", {
      storeName: "top-tokens",
      emptyMessage: msg("top-token-list-empty-message"),
    });
  }

  protected async fetchTokens(): Promise<Token[]> {
    const tokens = await TokenService.fetchTopTokens(this.lastRank);
    this.lastRank = tokens[tokens.length - 1]?.rank;
    return tokens;
  }
}
