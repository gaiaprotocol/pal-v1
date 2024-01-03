import { Supabase } from "@common-module/app";
import { SignedUserManager } from "@common-module/social";
import EnvironmentManager from "../EnvironmentManager.js";
import PalUserPublic from "../database-interface/PalUserPublic.js";
import WalletManager from "../wallet/WalletManager.js";
import PalUserService from "./PalUserService.js";

class PalSignedUserManager extends SignedUserManager<PalUserPublic> {
  protected async fetchUser(userId: string) {
    return await PalUserService.fetchUser(userId);
  }

  public get walletLinked() {
    return this.user?.wallet_address !== undefined;
  }

  public async signIn() {
    await Supabase.signIn("twitter");
  }

  public async linkWallet() {
    if (!WalletManager.connected) await WalletManager.connect();

    const walletAddress = WalletManager.address;
    if (!walletAddress) throw new Error("Wallet is not connected");

    const { data: nonceData, error: nonceError } = await Supabase.client
      .functions.invoke("new-wallet-linking-nonce", {
        body: { walletAddress },
      });
    if (nonceError) throw nonceError;

    const signedMessage = await WalletManager.signMessage(
      `${EnvironmentManager.messageForWalletLinking}\n\nNonce: ${nonceData.nonce}`,
    );

    const { error: linkError } = await Supabase.client.functions
      .invoke(
        "link-wallet-to-user",
        { body: { walletAddress, signedMessage } },
      );
    if (linkError) throw linkError;

    if (this.user) {
      this.user.wallet_address = walletAddress;
      this.fireEvent("walletLinked");
    }
  }

  public async getContractSigner() {
    //TODO:
  }
}

export default new PalSignedUserManager();
