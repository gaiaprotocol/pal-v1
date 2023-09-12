import SupabaseManager from "../SupabaseManager.js";
import TokenInfo from "../data/TokenInfo.js";

class TokenInfoCacher {
  private tokenInfoMap: Map<string, TokenInfo> = new Map<string, TokenInfo>();

  public getCachedTokenInfo(tokenAddress: string): TokenInfo | undefined {
    return this.tokenInfoMap.get(tokenAddress);
  }

  public async getMultipleTokenInfo(tokenAddresses: string[]) {
    const tokenInfoList: TokenInfo[] = [];
    for (const tokenAddress of tokenAddresses) {
      const tokenInfo = this.tokenInfoMap.get(tokenAddress);
      if (tokenInfo) {
        tokenInfoList.push(tokenInfo);
        tokenAddresses.splice(tokenAddresses.indexOf(tokenAddress), 1);
      }
    }
    if (tokenAddresses.length === 0) {
      return tokenInfoList;
    }
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_tokens",
    ).select(
      "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
    ).in("token_address", tokenAddresses);
    if (error) {
      throw error;
    }
    if (data) {
      for (const tokenInfo of data as any) {
        tokenInfoList.push(tokenInfo);
        this.tokenInfoMap.set(
          (tokenInfo as TokenInfo).token_address,
          tokenInfo,
        );
      }
    }
    return tokenInfoList;
  }
}

export default new TokenInfoCacher();
