import { Button, DomNode, el, Router, View } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";
import Icon from "../component/Icon.js";

export default class Settings extends View {
  private container: DomNode;
  private myProfilePageContainer: DomNode;
  private socialContainer: DomNode;
  private walletContainer: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
        el("h1", "Settings"),
        /*
        //TODO: ios, android app
        el(
          "section.install",
          el("h2", "Install Pal"),
          el("p", "Install Pal to your home screen for a better experience."),
          new Button({
            tag: ".install-button",
            title: "Install",
          }),
        ),*/
        el(
          "section.push-notification",
          el("h2", new Icon("notifications"), "Push Notification"),
          el("p", "Get notified when you receive a message."),
          new Button({
            tag: ".push-notification-button",
            title: Notification.permission === "granted" ? "Enabled" : "Enable",
            disabled: Notification.permission === "granted",
            click: () => {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  console.log("알림 권한이 허용됨");

                  // FCM 메세지 처리
                } else {
                  console.log("알림 권한 허용 안됨");
                }
              });
            },
          }),
        ),
        this.myProfilePageContainer = el(
          "section.my-profile-page",
          el("h2", "My Profile Page"),
        ),
        this.socialContainer = el(
          "section.social",
          el("h2", "Linked Social Accounts"),
        ),
        this.walletContainer = el(
          "section.wallet",
          el("h2", "Connected Crypto Wallet"),
        ),
      ),
    );
    this.init();
  }

  private async init() {
    const { data, error } = await SupabaseManager.supabase.auth.getSession();
    if (!data?.session || error) {
      this.socialContainer.append(
        new Button({
          tag: ".x-login-button",
          title: "Sign in with 𝕏",
          click: () =>
            SupabaseManager.supabase.auth.signInWithOAuth({
              provider: "twitter",
            }),
        }),
      );
    } else {
      const xUsername = UserManager.user?.user_metadata.user_name;
      this.myProfilePageContainer.append(
        el(
          "p",
          el(
            "a",
            `https://pal.social/${xUsername}`,
            {
              href: `https://pal.social/${xUsername}`,
              click: (event) => {
                event.preventDefault();
                Router.go("/" + xUsername);
              },
            },
          ),
        ),
      );

      this.socialContainer.append(
        el(
          "p",
          "Linked to: ",
          el("a", UserManager.user?.user_metadata.full_name, {
            href: `https://x.com/${xUsername}`,
            target: "_blank",
          }),
        ),
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

      this.walletContainer.append(
        el(
          "p",
          "Connected to: ",
          el("a", UserManager.userWalletAddress, {
            href:
              `https://basescan.org/address/${UserManager.userWalletAddress}`,
            target: "_blank",
          }),
        ),
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
