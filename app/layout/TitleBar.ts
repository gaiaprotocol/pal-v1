import { Button, DomNode, el, StringUtil } from "common-app-module";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

export default class TitleBar extends DomNode {
  private titleDisplay: DomNode;

  constructor() {
    super(".title-bar");
    this.append(
      this.titleDisplay = el("h1"),
    );

    if (!PalSignedUserManager.signed) {
      this.append(
        new Button({
          tag: ".sign-in",
          title: "Sign in with 𝕏",
          click: () => PalSignedUserManager.signIn(),
        }),
      );
    } else if (!PalSignedUserManager.walletLinked) {
      this.append(
        new Button({
          tag: ".link-wallet",
          title: "Link wallet",
          //click: () => new LinkWalletPopup(),
        }),
      );
    } else {
      //TODO:
    }

    /*this.renderLinkWalletSection();
    this.container.onDelegate(
      KrewSignedUserManager,
      "walletLinked",
      () => this.renderLinkWalletSection(),
    );*/
  }

  public changeTitle(uri: string) {
    this.titleDisplay.text = uri === "" ? "Posts" : StringUtil.toTitleCase(uri);
  }
}
