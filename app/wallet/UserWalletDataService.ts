import { SupabaseService } from "@common-module/app";
import UserWalletData, {
  UserWalletDataSelectQuery,
} from "../database-interface/UserWalletData.js";

class UserWalletDataService extends SupabaseService<UserWalletData> {
  constructor() {
    super("user_wallets", UserWalletDataSelectQuery, 50);
  }

  public async fetch(
    walletAddress: string,
  ): Promise<UserWalletData | undefined> {
    return await this.safeSelectSingle((b) =>
      b.eq("wallet_address", walletAddress)
    );
  }
}

export default new UserWalletDataService();
