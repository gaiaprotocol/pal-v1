import { msg } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenList from "./TokenList.js";
import TokenService from "./TokenService.js";

export default class NewTokenList extends TokenList {
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".new-token-list", {
      storeName: "new-tokens",
      emptyMessage: msg("new-token-list-empty-message"),
    });
  }

  protected async fetchTokens(): Promise<Token[]> {
    const tokens = await TokenService.fetchNewTokens(this.lastCreatedAt);
    this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
    return tokens;
  }
}
