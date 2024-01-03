import { Button, DomNode, el, MaterialIcon, msg } from "@common-module/app";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TitleBarUserDisplay from "./title-bar/TitleBarUserDisplay.js";

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
      this.userSection.append(
        el("button.noti", new MaterialIcon("notifications"), {}),
        new TitleBarUserDisplay(PalSignedUserManager.user!),
      );
    }
  }

  public changeTitle(uri: string) {
    this.titleDisplay.text = msg(`title-${uri === "" ? "posts" : uri}`);
  }
}
