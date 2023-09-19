import { User } from "@supabase/supabase-js";
import { getNetwork, getWalletClient } from "@wagmi/core";
import { EventContainer } from "common-dapp-module";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import Config from "../Config.js";
import Constants from "../Constants.js";
import OnlineUserManager from "../OnlineUserManager.js";
import SupabaseManager from "../SupabaseManager.js";
import TokenInfoCacher from "../cacher/TokenInfoCacher.js";
import ChangeChainPopup from "../popup/ChangeChainPopup.js";
import ChangeWalletAddressPopup from "../popup/ChangeWalletAddressPopup.js";
import CreateTokenPopup from "../popup/token/CreateTokenPopup.js";
import ConnectWalletPopup from "../popup/user/ConnectWalletPopup.js";
import WalletManager from "./WalletManager.js";

class UserManager extends EventContainer {
  public user: User | undefined;
  public userWalletAddress: string | undefined;
  public userTokenAddress: string | undefined;

  public get signedIn() {
    return this.user !== undefined;
  }
  public get walletConnected() {
    return this.userWalletAddress !== undefined;
  }
  public get tokenCreated() {
    return this.userTokenAddress !== undefined;
  }

  public async getUserWalletAddress(userId: string) {
    const { data } = await SupabaseManager.supabase
      .from("user_details")
      .select()
      .eq("id", userId);
    return data?.[0]?.wallet_address;
  }

  public setSignedUserTokenAddress(tokenAddress: string) {
    this.userTokenAddress = tokenAddress;
    this.fireEvent("userTokenChanged");
  }

  public async getUserTokenAddress(userWalletAddress: string) {
    const { data } = await SupabaseManager.supabase
      .from("pal_tokens")
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      )
      .eq("owner", userWalletAddress);
    const tokenInfo = data?.[0] as any;
    if (tokenInfo) {
      TokenInfoCacher.set(tokenInfo);
      return tokenInfo.token_address;
    }
  }

  private clearData() {
    this.user = undefined;
    this.userWalletAddress = undefined;
    this.userTokenAddress = undefined;
  }

  public async loadUser() {
    this.clearData();

    const { data } = await SupabaseManager.supabase.auth.getSession();
    this.user = data?.session?.user;
    if (this.user) {
      this.userWalletAddress = await this.getUserWalletAddress(this.user.id);
      if (this.userWalletAddress) {
        this.userTokenAddress = await this.getUserTokenAddress(
          this.userWalletAddress,
        );
      }
      OnlineUserManager.track();
    }

    this.fireEvent("userLoaded");
  }

  public async signIn() {
    await SupabaseManager.supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  public async connectWallet() {
    return new Promise<void>((resolve) => {
      new ConnectWalletPopup(() => {
        this.loadUser();
        resolve();
      });
    });
  }

  public createToken() {
    const { chain } = getNetwork();
    if (chain?.id !== Config.palChainId) {
      new ChangeChainPopup();
    } else {
      new CreateTokenPopup();
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

  public async getSigner() {
    if (!this.user) this.signIn();

    if (WalletManager.connected !== true) {
      WalletManager.connect();
      return;
    }

    const walletClient = await getWalletClient();
    if (!walletClient) return;
    const { account, transport } = walletClient;
    if (account.address !== this.userWalletAddress) {
      if (!this.userWalletAddress) {
        this.connectWallet();
      } else {
        new ChangeWalletAddressPopup(this.userWalletAddress);
      }
      return;
    }

    const { chain } = getNetwork();
    if (!chain) return;

    if (chain.id !== Config.palChainId) {
      new ChangeChainPopup();
      return;
    }

    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
  }
}

export default new UserManager();
