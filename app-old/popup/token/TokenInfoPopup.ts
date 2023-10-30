import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
  Router,
} from "common-app-module";
import { ethers } from "ethers";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import Icon from "../../component/Icon.js";
import ActivityList from "../../component/list/ActivityList.js";
import MemberList from "../../component/list/MemberList.js";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import Tabs from "../../component/tab/Tabs.js";
import PalContract from "../../contract/PalContract.js";
import PalUserTokenContract from "../../contract/PalUserTokenContract.js";
import TokenInfo from "../../data/TokenInfo.js";
import UserManager from "../../user/UserManager.js";
import WalletManager from "../../user/WalletManager.js";
import BuyTokenPopup from "./BuyTokenPopup.js";
import EditTokenInfoPopup from "./EditTokenInfoPopup.js";
import SellTokenPopup from "./SellTokenPopup.js";

export default class TokenInfoPopup extends Popup {
  public content: DomNode;

  private profileImage: ProfileImageDisplay;
  private nameDisplay: DomNode;
  private symbolDisplay: DomNode;
  private descriptionDisplay: DomNode;
  private priceDisplay: DomNode;
  private feesDisplay: DomNode;

  private editButton: DomNode;
  private balanceDisplay: DomNode;
  private memberList: MemberList;
  private activityList: ActivityList;

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });

    let tabs;
    this.append(
      this.content = new Component(
        ".token-info-popup",
        el(
          "h1",
          this.profileImage = new ProfileImageDisplay(),
          el(
            ".name-and-symbol",
            this.nameDisplay = el("span.name"),
            this.symbolDisplay = el("span.symbol"),
          ),
          el(
            ".edit-button-container",
            this.editButton = el("a.hidden", new Icon("edit"), {
              click: () => new EditTokenInfoPopup(tokenAddress),
            }),
          ),
        ),
        el(
          "main",
          el(
            ".price-and-fees",
            el(
              ".price-container",
              el("label", "Price"),
              this.priceDisplay = el("span.price"),
            ),
            el(
              ".fees-container",
              el("label", "Trading Fees Earned"),
              this.feesDisplay = el("span.fees"),
            ),
          ),
          this.descriptionDisplay = el("p"),
          el(
            ".trade-info",
            el(
              ".balance",
              el("img.profile-image", {
                src: UserManager.user?.user_metadata.avatar_url,
              }),
              el("label", "Your Balance"),
              this.balanceDisplay = el("span.balance.loading"),
            ),
            el(
              ".buttons",
              new Button({
                title: "Buy",
                click: async () => {
                  if (!WalletManager.connected) {
                    await WalletManager.connect();
                  }
                  const popup = new BuyTokenPopup(tokenAddress);
                  popup.on("buyToken", () => this.fireEvent("buyToken"));
                },
              }),
              new Button({
                title: "Sell",
                click: async () => {
                  if (!WalletManager.connected) {
                    await WalletManager.connect();
                  }
                  const popup = new SellTokenPopup(tokenAddress);
                  popup.on("sellToken", () => this.fireEvent("sellToken"));
                },
              }),
            ),
          ),
        ),
        tabs = new Tabs([
          { id: "members", label: "Members" },
          { id: "activity", label: "Activity" },
        ]),
        this.memberList = new MemberList(),
        this.activityList = new ActivityList(),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".chat-room-button",
            click: () => {
              Router.go("/" + tokenAddress);
              this.delete();
            },
            title: "Go to Chat Room",
          }),
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
        ),
      ),
    );

    this.loadPrice();
    this.loadBalance();

    this.activityList.load({
      tokenAddresses: [tokenAddress],
    });

    tabs.on("select", (id: string) => {
      this.memberList.inactive();
      this.activityList.inactive();

      if (id === "members") {
        this.memberList.active();
      } else if (id === "activity") {
        this.activityList.active();
      }
    });
    tabs.select("members");

    this.onDelegate(
      TokenInfoCacher,
      "tokenInfoChanged",
      (tokenInfo: TokenInfo) => {
        if (tokenInfo.token_address === tokenAddress) {
          this.displayTokenInfo(tokenInfo);
        }
      },
    );
    this.load();
  }

  private async load() {
    const tokenInfo = await TokenInfoCacher.get(this.tokenAddress);
    if (tokenInfo) {
      this.displayTokenInfo(tokenInfo);
    }
  }

  private displayTokenInfo(tokenInfo: TokenInfo) {
    this.nameDisplay.text = tokenInfo.name;
    this.symbolDisplay.text = tokenInfo.symbol;
    this.descriptionDisplay.text = tokenInfo.metadata.description ??
      "No description";
    this.feesDisplay.text = `${
      ethers.formatEther(tokenInfo.trading_fees_earned)
    } ETH`;

    this.memberList.load(tokenInfo);

    this.loadOwner(tokenInfo);
  }

  private async loadOwner(tokenInfo: TokenInfo) {
    this.profileImage.load(tokenInfo.owner);

    const tokenOwner = await UserDetailsCacher.get(tokenInfo.owner);
    if (tokenOwner?.wallet_address === UserManager.userWalletAddress) {
      this.editButton.deleteClass("hidden");
    }
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPrice(
      this.tokenAddress,
      ethers.parseEther("1"),
    );
    this.priceDisplay.text = `${ethers.formatEther(price)} ETH`;
  }

  private async loadBalance() {
    if (UserManager.userWalletAddress) {
      const balance = await new PalUserTokenContract(this.tokenAddress)
        .balanceOf(UserManager.userWalletAddress);
      this.balanceDisplay.text = ethers.formatEther(balance);
    }
  }
}
