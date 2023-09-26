import { User } from "@supabase/supabase-js";
import { getNetwork, getWalletClient } from "@wagmi/core";
import { EventContainer } from "common-dapp-module";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import Config from "../Config.js";
import Constants from "../Constants.js";
import FCMManager from "../FCMManager.js";
import FavoriteManager from "../FavoriteManager.js";
import OnlineUserManager from "../OnlineUserManager.js";
import SupabaseManager from "../SupabaseManager.js";
import TokenInfoCacher from "../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";
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
    const user = data?.[0];
    if (user) {
      UserDetailsCacher.set(user);
      return user.wallet_address;
    }
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
    FavoriteManager.clear();
  }

  public async loadUser() {
    this.clearData();

    const { data } = await SupabaseManager.supabase.auth.getSession();
    this.user = data?.session?.user;
    if (this.user) {
      const [userWalletAddress] = await Promise.all([
        this.getUserWalletAddress(this.user.id),
        FavoriteManager.loadSignedUserFavoriteTokens(),
      ]);
      this.userWalletAddress = userWalletAddress;
      if (this.userWalletAddress) {
        this.userTokenAddress = await this.getUserTokenAddress(
          this.userWalletAddress,
        );
      }
      OnlineUserManager.track();

      (async () => {
        await FCMManager.requestPermissionAndSaveToken();
        const session = await SupabaseManager.supabase.auth.getSession();
        fetch(`${Config.alwaysOnServerURL}/pal/check-fcm-subscription`, {
          method: "POST",
          body: JSON.stringify({
            access_token: session.data.session?.access_token,
          }),
        });
      })();
    }

    this.fireEvent("userLoaded");
  }

  public async signIn() {
    await SupabaseManager.supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: Config.devMode === true
        ? {
          redirectTo: "http://localhost:8413/",
        }
        : undefined,
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

  private async checkChain() {
    if (!this.user) {
      this.signIn();
      return { checked: false };
    }

    if (WalletManager.connected !== true) {
      WalletManager.connect();
      return { checked: false };
    }

    const walletClient = await getWalletClient();
    if (!walletClient) return { checked: false };
    const { account, transport } = walletClient;
    if (account.address !== this.userWalletAddress) {
      if (!this.userWalletAddress) {
        this.connectWallet();
      } else {
        new ChangeWalletAddressPopup(this.userWalletAddress);
      }
      return { checked: false };
    }

    const { chain } = getNetwork();
    if (!chain) return { checked: false };

    if (chain.id !== Config.palChainId) {
      new ChangeChainPopup();
      return { checked: false };
    }

    return { checked: true, chain, account, transport };
  }

  public async createToken() {
    const { checked } = await this.checkChain();
    if (checked) {
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
    const { checked, chain, account, transport } = await this.checkChain();
    if (checked && chain && account && transport) {
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      const provider = new BrowserProvider(transport, network);
      return new JsonRpcSigner(provider, account.address);
    }
  }
}

export default new UserManager();
