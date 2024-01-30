import { Supabase } from "@common-module/app";
import { SocialUserService } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalUserPublic from "../database-interface/PalUserPublic.js";

class PalUserService extends SocialUserService<PalUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }

  public async fetchByWalletAddress(
    walletAddress: string,
  ): Promise<PalUserPublic | undefined> {
    return await this.safeSelectSingle((b) =>
      b.eq("wallet_address", walletAddress)
    );
  }

  public async fetchTokenHolders(
    chain: BlockchainType,
    tokenAddress: string,
    lastBalance?: string,
  ): Promise<(PalUserPublic & { balance: string })[]> {
    const { data, error } = await Supabase.client.rpc("get_token_holders", {
      p_chain: chain,
      p_token_address: tokenAddress,
      last_balance: lastBalance,
      max_count: this.fetchLimit,
    });
    if (error) throw error;
    return data;
  }

  public async fetchPortfolioValue(walletAddress: string): Promise<bigint> {
    const { data, error } = await Supabase.client.rpc("get_portfolio_value", {
      p_wallet_address: walletAddress,
    });
    if (error) throw error;
    return BigInt(data ?? "0");
  }
}

export default new PalUserService();
