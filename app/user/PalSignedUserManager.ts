import { Supabase } from "common-app-module";
import { SignedUserManager, SoFiUserPublic } from "sofi-module";
import EnvironmentManager from "../EnvironmentManager.js";
import WalletManager from "../wallet/WalletManager.js";
import PalUserService from "./PalUserService.js";

class PalSignedUserManager extends SignedUserManager<SoFiUserPublic> {
  protected async fetchUser(userId: string) {
    return await PalUserService.fetchUser(userId);
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
