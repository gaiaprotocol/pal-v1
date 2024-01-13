import { Supabase, SupabaseService } from "@common-module/app";
import Token, { TokenSelectQuery } from "../database-interface/Token.js";

class TokenService extends SupabaseService<Token> {
  constructor() {
    super("tokens", TokenSelectQuery, 50);
  }

  public async fetchOwnedTokens(
    owner: string,
    lastCreatedAt: string | undefined,
  ) {
    const { data, error } = await Supabase.client.rpc(
      "get_owned_tokens",
      {
        p_wallet_address: owner,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return Supabase.safeResult<Token[]>(data ?? []);
  }
}

export default new TokenService();
