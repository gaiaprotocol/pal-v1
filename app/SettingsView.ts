import {
  Button,
  DomNode,
  el,
  LoadingSpinner,
  msg,
  View,
  ViewParams,
} from "@common-module/app";
import Layout from "./layout/Layout.js";
import PalSignedUserManager from "./user/PalSignedUserManager.js";

export default class SettingsView extends View {
  private linkWalletSection: DomNode | undefined;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
        !PalSignedUserManager.signed
          ? undefined
          : this.linkWalletSection = el("section.link-wallet"),
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
      el("header", el("h2", msg("settings-view-link-wallet-section-title"))),
      el(
        "main",
        PalSignedUserManager.walletLinked
          ? el(
            "p.linked",
            msg("settings-view-link-wallet-section-linked").trim() + " ",
            el("a", PalSignedUserManager.user?.wallet_address, {
              href:
                `https://etherscan.io/address/${PalSignedUserManager.user?.wallet_address}`,
              target: "_blank",
            }),
          )
          : el("p", msg("settings-view-link-wallet-section-description")),
      ),
      el(
        "footer",
        new Button({
          title: msg("settings-view-link-wallet-button"),
          click: async (event, button) => {
            button.loading = true;
            try {
              await PalSignedUserManager.linkWallet();
              this.renderLinkWalletSection();
            } catch (e) {
              console.error(e);
              button.loading = false;
            }
          },
        }),
      ),
    );
  }
}
