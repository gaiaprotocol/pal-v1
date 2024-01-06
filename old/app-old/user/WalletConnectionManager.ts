import SupabaseManager from "../SupabaseManager.js";
import WalletManager from "./WalletManager.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

class WalletConnectionManager {
  public connected = false;

  public async connect() {
    const walletAddress = WalletManager.address;
    if (walletAddress === undefined) {
      throw new Error("Wallet is not connected");
    }

    const { data: nonceData, error: nonceError } = await SupabaseManager
      .supabase.functions.invoke(
        "new-nonce",
        { body: { walletAddress } },
      );

    if (nonceError) {
      throw nonceError;
    }

    const signedMessage = await WalletManager.signMessage(
      `Connect to Pal\nNonce: ${nonceData.nonce}`,
    );

    const { error } = await SupabaseManager.supabase.functions.invoke(
      "connect-wallet",
      { body: { walletAddress, signedMessage } },
    );

    if (error) {
      throw error;
    }
  }
}

export default new WalletConnectionManager();
