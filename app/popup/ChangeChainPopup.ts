import { switchNetwork } from "@wagmi/core";
import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import Config from "../Config.js";

export default class ChangeChainPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".change-chain-popup",
        el("h1", "Switch to Base Chain for Pal"),
        el(
          "main",
          el("img", { src: "/images/basechain-banner.png" }),
          el(
            "p",
            "Pal operates on the Base Chain. To utilize Pal, please change your wallet's chain to Base Chain.",
          ),
          el("a", "What is Base Chain?", {
            href: "https://base.org/",
            target: "_blank",
          }),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Later",
          }),
          new Button({
            type: ButtonType.Text,
            tag: ".switch-button",
            click: async () => {
              await switchNetwork({ chainId: Config.palChainId });
              this.delete();
            },
            title: "Switch Now",
          }),
        ),
      ),
    );
  }
}
