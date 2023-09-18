import { User } from "@supabase/supabase-js";
import { getNetwork, getWalletClient } from "@wagmi/core";
import { EventContainer } from "common-dapp-module";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import Config from "../Config.js";
import OnlineUserManager from "../OnlineUserManager.js";
import SupabaseManager from "../SupabaseManager.js";
import TokenInfo from "../data/TokenInfo.js";
import ChangeChainPopup from "../popup/ChangeChainPopup.js";
import ChangeWalletAddressPopup from "../popup/ChangeWalletAddressPopup.js";
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

  public setSignedUserToken(token: TokenInfo) {
    this.userToken = token;
    this.fireEvent("userTokenChanged");
  }

  public async getUserToken(userWalletAddress: string) {
    const { data } = await SupabaseManager.supabase
      .from("pal_tokens")
      .select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      )
      .eq("owner", userWalletAddress);
    return data?.[0] as any;
  }

  private clearData() {
    this.user = undefined;
    this.userWalletAddress = undefined;
    this.userToken = undefined;
  }

  public async loadUser() {
    this.clearData();

    const { data } = await SupabaseManager.supabase.auth.getSession();
    this.user = data?.session?.user;
    if (this.user) {
      this.userWalletAddress = await this.getUserWalletAddress(this.user.id);
      if (this.userWalletAddress) {
        this.userToken = await this.getUserToken(
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
