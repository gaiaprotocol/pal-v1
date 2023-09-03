import { DomNode, el } from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../contract/PalContract.js";
import TokenInfoPopup from "../popup/token/TokenInfoPopup.js";
import UserManager from "../user/UserManager.js";
import WalletManager from "../user/WalletManager.js";

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
      const price = await PalContract.getBuyPriceAfterFee(
        UserManager.userToken!.address,
        ethers.parseEther("1"),
      );
      this.empty().append(
        el(
          "a.token-info-button",
          `1 ${UserManager.userToken!.symbol} = ${
            ethers.formatEther(price)
          } ETH`,
          {
            click: () => new TokenInfoPopup(UserManager.userToken!),
          },
        ),
      );
    }
  }
}
