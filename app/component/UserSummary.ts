import { DomNode, el } from "common-dapp-module";
import UserManager from "../user/UserManager.js";
import WalletManager from "../user/WalletManager.js";
import TokenSummary from "./TokenSummary.js";

export default class UserSummary extends DomNode {
  constructor() {
    super(".user-summary");
    this.init();

    this.onDelegate(WalletManager, "accountChanged", () => this.init());
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
        el("a.wallet-login-button", "Connect Wallet", {
          click: () => UserManager.connectWallet(),
        }),
      );
    } else if (!UserManager.tokenCreated) {
      this.empty().append(el("a.create-token-button", "Create Token", {
        click: () => UserManager.createToken(),
      }));
    } else {
      this.empty().append(new TokenSummary(UserManager.userToken!));
    }
  }
}
