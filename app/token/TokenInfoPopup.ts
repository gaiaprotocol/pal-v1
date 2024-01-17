import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
  Tabs,
} from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PreviewToken from "../database-interface/PreviewToken.js";
import Token from "../database-interface/Token.js";
import TokenService from "./TokenService.js";

export default class TokenInfoPopup extends Popup {
  private tokenImage: DomNode;
  private tokenName: DomNode;
  private editButtonWrapper: DomNode;
  private descriptionDisplay: DomNode;
  private ownerDisplay: DomNode;

  private holderCountDisplay: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;

  private tabs: Tabs;
  private holderList: TokenHolderList;
  private activityList: TokenActivityList;

  constructor(
    private chain: BlockchainType,
    private tokenAddress: string,
    token?: Token,
    previewToken?: PreviewToken,
  ) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".token-info-popup.popup",
        el(
          "header",
          this.tokenImage = el(".token-image"),
          this.tokenName = el("h1", "..."),
          this.editButtonWrapper = el(".edit-button-wrapper"),
        ),
        el(
          "main",
          this.descriptionDisplay = el("p.description"),
          this.ownerDisplay = el("section.owner"),
          el(
            "section.metrics",
            el(
              ".holder-count",
              el("label", "Holders"),
              this.holderCountDisplay = el("span"),
            ),
            el(".price", el("label", "Price"), this.priceDisplay = el("span")),
          ),
          el(
            "section.balance",
            el("label", "Your Balance"),
            this.balanceDisplay = el("span"),
          ),
        ),
        this.tabs = new Tabs("token-info-popup", [
          { id: "holders", label: "Holders" },
          { id: "activity", label: "Activity" },
        ]),
        this.holderList = new TokenHolderList(),
        this.activityList = new TokenActivityList(),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            title: msg("cancel-button"),
            click: () => this.delete(),
          }),
        ),
      ),
    );

    if (previewToken) {
      AvatarUtil.selectLoadable(this.tokenImage, [
        previewToken.image_thumb,
        previewToken.stored_image_thumb,
      ]);
      this.tokenName.empty().append(
        previewToken.name,
        " ",
        el("span.symbol", previewToken.symbol),
      );
    }

    token ? this.render(token) : this.fetchToken();
  }

  private render(token: Token) {
    console.log(token);
    //TODO:
    this.loadBalance();
  }

  private async fetchToken() {
    const token = await TokenService.fetchToken(this.chain, this.tokenAddress);
    if (token) this.render(token);
  }

  private loadBalance() {
    //TODO:
  }
}
