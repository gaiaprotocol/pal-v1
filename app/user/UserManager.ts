import { User } from "@supabase/supabase-js";
import { getNetwork, switchNetwork } from "@wagmi/core";
import { Confirm, EventContainer } from "common-dapp-module";
import Config from "../Config.js";
import SupabaseManager from "../SupabaseManager.js";
import PalContract from "../contract/PalContract.js";
import TokenInfo from "../data/TokenInfo.js";
import CreateTokenPopup from "../popup/token/CreateTokenPopup.js";
import ConnectWalletPopup from "../popup/user/ConnectWalletPopup.js";
import WalletManager from "./WalletManager.js";

class UserManager extends EventContainer {
  public user: User | undefined;
  public userWalletAddress: string | undefined;
  public userToken: TokenInfo | undefined;

  public get signedIn() {
    return this.user !== undefined;
  }
  public get walletConnected() {
    return this.userWalletAddress !== undefined;
  }
  public get tokenCreated() {
    return this.userToken !== undefined;
  }

  public async getUserWalletAddress(userId: string) {
    const { data } = await SupabaseManager.supabase
      .from("user_details")
      .select()
      .eq("id", userId);
    return data?.[0]?.wallet_address;
  }

  public async getUserToken(userWalletAddress: string) {
    const { data } = await SupabaseManager.supabase
      .from("pal_tokens")
      .select()
      .eq("owner", userWalletAddress);
    return data?.[0];
  }

  public async loadUser() {
    const { data } = await SupabaseManager.supabase.auth.getSession();
    this.user = data?.session?.user;
    if (this.user) {
      this.userWalletAddress = await this.getUserWalletAddress(this.user.id);
      if (this.userWalletAddress) {
        this.userToken = await this.getUserToken(
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

  public createToken() {
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
      new CreateTokenPopup(async (name, symbol, metadata) => {
        const address = await PalContract.createToken(name, symbol);
        if (WalletManager.address) {
          this.userToken = {
            token_address: address,
            owner: WalletManager.address,
            name,
            symbol,
            metadata,
            view_token_required: "1000000000000000000",
            write_token_required: "1000000000000000000",
            last_fetched_price: "0",
          };
        }
      });
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
