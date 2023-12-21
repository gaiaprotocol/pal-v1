import { Button, DomNode, el, msg, StringUtil } from "common-app-module";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

export default class TitleBar extends DomNode {
  private titleDisplay: DomNode;
  private userSection: DomNode;

  constructor() {
    super(".title-bar");
    this.append(
      this.titleDisplay = el("h1"),
      this.userSection = el("section.user"),
    );

    this.renderUserSection();
    this.onDelegate(
      PalSignedUserManager,
      "walletLinked",
      () => this.renderUserSection(),
    );
  }

  private renderUserSection() {
    this.userSection.empty();

    if (!PalSignedUserManager.signed) {
      this.userSection.append(
        new Button({
          tag: ".sign-in",
          title: "Sign in with 𝕏",
          click: () => PalSignedUserManager.signIn(),
        }),
      );
    } else if (!PalSignedUserManager.walletLinked) {
      this.userSection.append(
        new Button({
          tag: ".link-wallet",
          title: "Link wallet",
          click: () => PalSignedUserManager.linkWallet(),
        }),
      );
    } else {
      //TODO:
    }
  }

  public changeTitle(uri: string) {
    this.titleDisplay.text = msg(`title-${uri === "" ? "posts" : uri}`);
  }
}
