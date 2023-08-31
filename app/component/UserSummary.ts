import { getNetwork, switchNetwork } from "@wagmi/core";
import { Confirm, DomNode, el } from "common-dapp-module";
import Config from "../Config.js";
import SupabaseManager from "../SupabaseManager.js";
import WalletManager from "../WalletManager.js";
import PalContract from "../contract/PalContract.js";

export default class UserSummary extends DomNode {
  constructor() {
    super(".user-summary");
    this.init();

    this.onDelegate(WalletManager, "accountChanged", () => this.init());
  }

  private async init() {
    const { data, error } = await SupabaseManager.supabase.auth.getSession();
    if (!data?.session || error) {
      this.empty().append(
        el("a.twitter-login-button", "Sign in with 𝕏", {
          click: () =>
            SupabaseManager.supabase.auth.signInWithOAuth({
              provider: "twitter",
            }),
        }),
      );
    } else if (!WalletManager.connected) {
      this.empty().append(
        el("a.wallet-login-button", "Connect Wallet", {
          click: () => WalletManager.connect(),
        }),
      );
    } else {
      //TODO:
      this.empty().append(el("a.create-token-button", "Create Token", {
        click: async () => {
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
            PalContract.createToken("test", "test");
          }
        },
      }));
    }
  }
}
