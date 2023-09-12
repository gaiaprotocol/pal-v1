import { Button, DomNode, el, View } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";

export default class Settings extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
        el("h1", "Settings"),
      ),
    );
    this.init();
  }

  private async init() {
    const { data, error } = await SupabaseManager.supabase.auth.getSession();
    if (!data?.session || error) {
      this.container.append(
        new Button({
          tag: ".twitter-login-button",
          title: "Sign in with 𝕏",
          click: () =>
            SupabaseManager.supabase.auth.signInWithOAuth({
              provider: "twitter",
            }),
        }),
      );
    } else {
      this.container.append(
        new Button({
          tag: ".logout-button",
          title: "Sign out",
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
        new Button({
          tag: ".connect-wallet-button",
          title: "Connect Wallet",
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
