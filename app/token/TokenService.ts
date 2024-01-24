import { Supabase, SupabaseService } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import Token, { TokenSelectQuery } from "../database-interface/Token.js";

class TokenService extends SupabaseService<Token> {
  constructor() {
    super("tokens", TokenSelectQuery, 50);
  }

  protected enhanceTokenData(tokens: Token[]): Token[] {
    const _tokens = Supabase.safeResult<Token[]>(tokens);
    for (const token of _tokens as any) {
      if (token.owner_user_id) {
        token.owner = {
          user_id: token.owner_user_id,
          wallet_address: token.owner_wallet_address,
          display_name: token.owner_display_name,
          avatar: token.owner_avatar,
          avatar_thumb: token.owner_avatar_thumb,
          stored_avatar: token.owner_stored_avatar,
          stored_avatar_thumb: token.owner_stored_avatar_thumb,
          x_username: token.owner_x_username,
        };
      }
    }
    return _tokens;
  }

  public async fetchToken(chain: BlockchainType, tokenAddress: string) {
    const { data, error } = await Supabase.client.rpc(
      "get_token",
      {
        p_chain: chain,
        p_token_address: tokenAddress,
      },
    );
    if (error) throw error;
    return this.enhanceTokenData(data ?? [])[0];
  }

  public async fetchHeldOrOwnedTokens(
    owner: string,
    lastCreatedAt: string | undefined,
  ) {
    const { data, error } = await Supabase.client.rpc(
      "get_held_or_owned_tokens",
      {
        p_wallet_address: owner,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return this.enhanceTokenData(data ?? []);
  }

  public async fetchNewTokens(lastCreatedAt: string | undefined) {
    const { data, error } = await Supabase.client.rpc(
      "get_new_tokens",
      {
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return this.enhanceTokenData(data ?? []);
  }

  public async fetchTopTokens(lastRank: number | undefined) {
    const { data, error } = await Supabase.client.rpc(
      "get_top_tokens",
      {
        last_rank: lastRank,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return this.enhanceTokenData(data ?? []);
  }

  public async fetchTrendingTokens(lastPurchasedAt: string | undefined) {
    const { data, error } = await Supabase.client.rpc(
      "get_trending_tokens",
      {
        last_purchased_at: lastPurchasedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return this.enhanceTokenData(data ?? []);
  }
}

export default new TokenService();
