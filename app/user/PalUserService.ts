import { Supabase } from "@common-module/app";
import { SocialUserService } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalUserPublic from "../database-interface/PalUserPublic.js";

class PalUserService extends SocialUserService<PalUserPublic> {
  constructor() {
    super("users_public", "*", 50);
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
}

export default new PalUserService();
