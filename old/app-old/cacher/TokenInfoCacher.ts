import { EventContainer } from "@common-module/app";
import Constants from "../Constants.js";
import SupabaseManager from "../SupabaseManager.js";
import TokenInfo from "../data/TokenInfo.js";

class TokenInfoCacher extends EventContainer {
  private tokenInfoMap: Map<string, TokenInfo> = new Map<string, TokenInfo>();

  public init() {
    SupabaseManager.supabase
      .channel("token-info-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pal_tokens",
        },
        async (payload: any) => {
          if (
            payload.eventType === "INSERT" || payload.eventType === "UPDATE"
          ) {
            await this.getFromDB(payload.new.token_address);
          }
        },
      )
      .subscribe();
  }

  public set(tokenInfo: TokenInfo) {
    this.tokenInfoMap.set(tokenInfo.token_address, tokenInfo);
    this.fireEvent("tokenInfoChanged", tokenInfo);
  }

  public getCached(tokenAddress: string): TokenInfo | undefined {
    return this.tokenInfoMap.get(tokenAddress);
  }

  private async getFromDB(
    tokenAddress: string,
  ): Promise<TokenInfo | undefined> {
    const { data, error } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      ).eq("token_address", tokenAddress);
    if (error) {
      console.error(error);
      return;
    }
    const tokenInfo: TokenInfo | undefined = data?.[0] as any;
    if (!tokenInfo) {
      return;
    }
    this.set(tokenInfo);
    return tokenInfo;
  }

  public async get(tokenAddress: string): Promise<TokenInfo | undefined> {
    if (this.tokenInfoMap.get(tokenAddress)) {
      return this.tokenInfoMap.get(tokenAddress);
    }
    return await this.getFromDB(tokenAddress);
  }

  public async load(tokenAddresses: string[]) {
    const tokenInfoArray: TokenInfo[] = [];
    for (const tokenAddress of tokenAddresses) {
      const tokenInfo = this.tokenInfoMap.get(tokenAddress);
      if (tokenInfo) {
        tokenInfoArray.push(tokenInfo);
        tokenAddresses.splice(tokenAddresses.indexOf(tokenAddress), 1);
      }
    }
    if (tokenAddresses.length === 0) {
      return tokenInfoArray;
    }
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_tokens",
    ).select(
      Constants.PAL_TOKENS_SELECT_QUERY,
    ).in("token_address", tokenAddresses);
    if (error) {
      throw error;
    }
    if (data) {
      this.cache(data as any);
    }
    return tokenInfoArray;
  }

  public cache(tokenInfoSet: TokenInfo[]) {
    for (const tokenInfo of tokenInfoSet) {
      this.set(tokenInfo);
    }
  }
}

export default new TokenInfoCacher();
