import { DomNode, el, View } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";
import WalletManager from "../user/WalletManager.js";
import Layout from "./Layout.js";
import UserManager from "../user/UserManager.js";

export default class Settings extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
      ),
    );
    this.init();
  }

  private async init() {
    const { data, error } = await SupabaseManager.supabase.auth.getSession();
    if (!data?.session || error) {
      this.container.append(
        el("a.twitter-login-button", "Sign in with 𝕏", {
          click: () =>
            SupabaseManager.supabase.auth.signInWithOAuth({
              provider: "twitter",
            }),
        }),
      );
    } else {
      this.container.append(
        el("a.logout-button", "Sign out", {
          click: async () => {
            const { error } = await SupabaseManager.supabase.auth
              .signOut();
            if (error) {
              console.error(error);
            } else {
              window.location.reload();
            }
          },
        }),
      );

      this.container.append(
        el("a.connect-wallet-button", "Connect Wallet", {
          click: () => UserManager.connectWallet(),
        }),
      );
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
