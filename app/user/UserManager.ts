import { getNetwork, switchNetwork } from "@wagmi/core";
import { Confirm, EventContainer } from "common-dapp-module";
import Config from "../Config.js";
import SupabaseManager from "../SupabaseManager.js";
import PalContract from "../contract/PalContract.js";
import ConnectWalletPopup from "../popup/user/ConnectWalletPopup.js";

class UserManager extends EventContainer {
  public userId: string | undefined;
  public userWalletAddress: string | undefined;
  public userTokenAddress: string | undefined;

  public get signedIn() {
    return this.userId !== undefined;
  }
  public get walletConnected() {
    return this.userWalletAddress !== undefined;
  }
  public get tokenCreated() {
    return this.userTokenAddress !== undefined;
  }

  public async getUserWalletAddress(userId: string) {
    const { data } = await SupabaseManager.supabase
      .from("user_wallets")
      .select()
      .eq("id", userId);
    return data?.[0]?.wallet_address;
  }

  public async getUserTokenAddress(userWalletAddress: string) {
    const { data } = await SupabaseManager.supabase
      .from("pal_tokens")
      .select()
      .eq("owner", userWalletAddress);
    return data?.[0]?.address;
  }

  public async loadUser() {
    const { data } = await SupabaseManager.supabase.auth.getSession();
    this.userId = data?.session?.user?.id;
    if (this.userId) {
      this.userWalletAddress = await this.getUserWalletAddress(this.userId);
      if (this.userWalletAddress) {
        this.userTokenAddress = await this.getUserTokenAddress(
          this.userWalletAddress,
        );
      }
    }
    this.fireEvent("userLoaded");
  }

  public async signIn() {
    await SupabaseManager.supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  public connectWallet() {
    new ConnectWalletPopup(() => this.loadUser());
  }

  public async createToken() {
    const { chain } = getNetwork();
    if (chain?.id !== Config.palChainId) {
      new Confirm({
        title: "Wrong Network",
        message: "Please switch to Base network to create tokens.",
        confirmTitle: "Switch",
      }, async () => {
        switchNetwork({ chainId: Config.palChainId });
      });
    } else {
      //TODO:
      this.userTokenAddress = await PalContract.createToken("test", "test");
    }
  }

  public async signOut() {
    const { error } = await SupabaseManager.supabase.auth
      .signOut();
    if (error) {
      console.error(error);
    } else {
      window.location.reload();
    }
  }
}

export default new UserManager();
