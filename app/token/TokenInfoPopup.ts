import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Jazzicon,
  LoadingSpinner,
  MaterialIcon,
  msg,
  Popup,
  Router,
  StringUtil,
  Tabs,
} from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import { ethers } from "ethers";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalContract from "../contracts/PalContract.js";
import PalUserTokenContract from "../contracts/PalUserTokenContract.js";
import PreviewToken from "../database-interface/PreviewToken.js";
import Token from "../database-interface/Token.js";
import TrackEventManager from "../TrackEventManager.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenActivityList from "./TokenActivityList.js";
import TokenHolderList from "./TokenHolderList.js";
import TokenService from "./TokenService.js";

export default class TokenInfoPopup extends Popup {
  private tokenImage: DomNode;
  private tokenName: DomNode;
  private descriptionDisplay: DomNode;
  private ownerDisplay: DomNode;

  private holderCountDisplay: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;
  private buyButton: Button;
  private sellButton: Button;

  private tabs: Tabs;
  private holderList: TokenHolderList;
  private activityList: TokenActivityList;

  private footer: DomNode;

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
          this.tokenName = el("h1", new LoadingSpinner()),
        ),
        el(
          "main",
          this.descriptionDisplay = el("p.description"),
          this.ownerDisplay = el(
            "section.owner",
            el("h3", "Owner"),
            new LoadingSpinner(),
          ),
          el(
            ".metrics",
            el(
              "section.holder-count",
              el("h3", "Holders"),
              this.holderCountDisplay = el("span.value", new LoadingSpinner()),
            ),
            el(
              "section.price",
              el("h3", "Price"),
              this.priceDisplay = el("span.value", new LoadingSpinner()),
            ),
          ),
          el(
            "section.balance",
            el(
              ".info",
              el("h3", "Your Balance"),
              this.balanceDisplay = el("span.value", new LoadingSpinner()),
            ),
            this.buyButton = new Button({
              title: "Buy",
              click: () => this.buyToken(),
            }),
            this.sellButton = new Button({
              title: "Sell",
              click: () => this.sellToken(),
            }),
          ),
        ),
        this.tabs = new Tabs("token-info-popup", [
          { id: "holders", label: "Holders" },
          { id: "activity", label: "Activity" },
        ]),
        this.holderList = new TokenHolderList(
          chain,
          tokenAddress,
          previewToken ? previewToken.symbol : "",
        ),
        this.activityList = new TokenActivityList(chain, tokenAddress),
        this.footer = el(
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

    this.tabs.on("select", (id: string) => {
      [
        this.holderList,
        this.activityList,
      ].forEach((list) => list.hide());
      if (id === "holders") this.holderList.show();
      else if (id === "activity") this.activityList.show();
    }).init();

    this.loadBalance();
  }

  private render(token: Token) {
    AvatarUtil.selectLoadable(this.tokenImage, [
      token.image_thumb,
      token.stored_image_thumb,
    ]);

    this.tokenName.empty().append(
      token.name,
      " ",
      el("span.symbol", token.symbol),
    );

    if (
      (typeof token.owner === "string" &&
        token.owner === PalSignedUserManager.user?.wallet_address) ||
      (typeof token.owner !== "string" &&
        token.owner.wallet_address ===
          PalSignedUserManager.user?.wallet_address)
    ) {
      this.tokenName.append(
        new Button({
          type: ButtonType.Text,
          icon: new MaterialIcon("edit"),
          click: () => {
            //TODO:
          },
        }),
      );

      new Button({
        title: "Edit",
        click: () => {
          //TODO:
        },
      }).appendTo(this.footer, 0);
    }

    this.descriptionDisplay.text = token.metadata?.description ?? "";

    const avatar = el(".avatar");

    if (typeof token.owner !== "string") {
      AvatarUtil.selectLoadable(avatar, [
        token.owner.avatar_thumb,
        token.owner.stored_avatar_thumb,
      ]);
    }

    this.ownerDisplay.empty().append(
      el("h3", "Owner"),
      el(
        ".info-container",
        typeof token.owner === "string"
          ? new Jazzicon(".avatar", token.owner)
          : avatar,
        typeof token.owner === "string"
          ? el(".owner", StringUtil.shortenEthereumAddress(token.owner))
          : el(
            ".info",
            el(".name", token.owner.display_name),
            el(".x-username", `@${token.owner.x_username}`),
          ),
        {
          click: () => {
            if (typeof token.owner !== "string") {
              Router.go(`/${token.owner.x_username}`);
              this.delete();
            } else {
              open(`https://etherscan.io/address/${token.owner}`);
            }
          },
        },
      ),
    );

    this.holderCountDisplay.text = token.holder_count.toString();
    this.priceDisplay.text = StringUtil.numberWithCommas(
      ethers.formatEther(token.last_fetched_price),
    );

    this.holderList.symbol = token.symbol;
  }

  private async fetchToken() {
    const token = await TokenService.fetchToken(this.chain, this.tokenAddress);
    if (token) this.render(token);
  }

  private async loadBalance() {
    const contract = new PalUserTokenContract(this.chain, this.tokenAddress);
    const walletAddress = PalSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      const balance = await contract.balanceOf(walletAddress);
      this.balanceDisplay.text = StringUtil.numberWithCommas(
        ethers.formatEther(balance),
      );
    } else {
      this.balanceDisplay.text = "0";
    }
  }

  private async buyToken() {
    this.buyButton.title = "Buying...";
    try {
      const contract = new PalContract(this.chain);
      await contract.buyToken(this.tokenAddress, ethers.parseEther("1"));
      await TrackEventManager.trackEvent(this.chain);
      this.delete();
      Router.go(`/${this.chain}/${this.tokenAddress}`);
    } catch (e) {
      console.error(e);
      this.buyButton.title = "Buy";
    }
  }

  private async sellToken() {
    this.sellButton.title = "Selling...";
    try {
      const contract = new PalContract(this.chain);
      await contract.sellToken(this.tokenAddress, ethers.parseEther("1"));
      await TrackEventManager.trackEvent(this.chain);
      this.delete();
    } catch (e) {
      console.error(e);
      this.sellButton.title = "Sell";
    }
  }
}
