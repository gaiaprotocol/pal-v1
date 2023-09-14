import { Button, DomNode, el } from "common-dapp-module";
import UserManager from "../user/UserManager.js";
import TokenSummary from "./TokenSummary.js";

export default class UserSummary extends DomNode {
  constructor() {
    super(".user-summary");
    this.init();
    this.onDelegate(UserManager, "userWalletAddressChanged", () => this.init());
    this.onDelegate(UserManager, "userTokenChanged", () => this.init());
  }

  private async init() {
    if (!UserManager.signedIn) {
      this.empty().append(
        el("a.twitter-login-button", "Sign in with 𝕏", {
          click: () => UserManager.signIn(),
        }),
      );
    } else if (!UserManager.walletConnected) {
      this.empty().append(
        new Button({
          tag: ".wallet-login-button",
          title: "Connect Wallet",
          click: () => UserManager.connectWallet(),
        }),
      );
    } else if (!UserManager.tokenCreated) {
      this.empty().append(
        new Button({
          tag: ".create-token-button",
          title: "Create Your Token",
          click: () => UserManager.createToken(),
        }),
      );
    } else {
      this.empty().append(new TokenSummary(UserManager.userToken!));
    }
  }
}
