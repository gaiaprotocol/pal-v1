import { Button, DomNode, el, msg, View, ViewParams } from "@common-module/app";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

export default class SettingsView extends View {
  private linkWalletSection: DomNode | undefined;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
        el("h1", msg("settings-view-title")),
        el(
          "main",
          !PalSignedUserManager.signed
            ? undefined
            : this.linkWalletSection = el("section.link-wallet"),
        ),
      ),
    );

    this.renderLinkWalletSection();
    this.container.onDelegate(
      PalSignedUserManager,
      "walletLinked",
      () => this.renderLinkWalletSection(),
    );
  }

  private renderLinkWalletSection() {
    this.linkWalletSection?.empty().append(
      el("h2", msg("settings-view-link-wallet-section-title")),
      el(
        "main",
        PalSignedUserManager.walletLinked
          ? el(
            "p.linked",
            msg("settings-view-link-wallet-section-linked").trim() + " ",
            el("a", PalSignedUserManager.user?.wallet_address),
          )
          : el("p", msg("settings-view-link-wallet-section-description")),
      ),
      el(
        "footer",
        new Button({
          title: msg("settings-view-link-wallet-button"),
          click: async (event, button) => {
            button.domElement.setAttribute("disabled", "disabled");
            button.text = msg("no-wallet-linked-linking");
            try {
              await PalSignedUserManager.linkWallet();
              this.renderLinkWalletSection();
            } catch (e) {
              console.error(e);
              button.domElement.removeAttribute("disabled");
              button.text = msg("settings-view-link-wallet-button");
            }
          },
        }),
      ),
    );
  }
}
