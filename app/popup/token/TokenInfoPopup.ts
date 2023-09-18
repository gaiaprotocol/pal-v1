import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
  Router,
} from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import { ethers } from "ethers";
import Icon from "../../component/Icon.js";
import ActivityList from "../../component/list/ActivityList.js";
import MemberList from "../../component/list/MemberList.js";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import Tabs from "../../component/tab/Tabs.js";
import PalContract from "../../contract/PalContract.js";
import PalTokenContract from "../../contract/PalTokenContract.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";
import BuyTokenPopup from "./BuyTokenPopup.js";
import EditTokenInfoPopup from "./EditTokenInfoPopup.js";
import SellTokenPopup from "./SellTokenPopup.js";

export default class TokenInfoPopup extends Popup {
  public content: DomNode;

  private profileImage: ProfileImageDisplay;
  private editButton: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;
  private memberList: MemberList;
  private activityList: ActivityList;

  constructor(private tokenInfo: TokenInfo) {
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
            el("span.name", tokenInfo.name),
            el("span.symbol", tokenInfo.symbol),
          ),
          el(
            ".edit-button-container",
            this.editButton = el("a.hidden", new Icon("edit"), {
              click: () => new EditTokenInfoPopup(tokenInfo),
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
              el("span.fees", ethers.formatEther(tokenInfo.trading_fees_earned) + " ETH"),
            ),
          ),
          el("p", tokenInfo.metadata.description ?? "No description"),
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
            new Button({
              title: "Buy",
              click: () => new BuyTokenPopup(tokenInfo.token_address),
            }),
            new Button({
              title: "Sell",
              click: () => new SellTokenPopup(tokenInfo.token_address),
            }),
          ),
        ),
        tabs = new Tabs([
          { id: "members", label: "Members" },
          { id: "activity", label: "Activity" },
        ]),
        this.memberList = new MemberList(tokenInfo),
        this.activityList = new ActivityList(),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".chat-room-button",
            click: () => {
              Router.go("/" + this.tokenInfo.token_address);
              this.delete();
            },
            title: "Go Chat Room",
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

    this.loadOwner();
    this.loadPrice();
    this.loadBalance();
    this.activityList.load({
      tokenAddresses: [tokenInfo.token_address],
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
  }

  private async loadOwner() {
    const { data, error } = await SupabaseManager.supabase.from("user_details")
      .select().eq("wallet_address", this.tokenInfo.owner);

    const tokenOwner = data?.[0];
    let profileImageSrc;
    if (tokenOwner) {
      profileImageSrc = tokenOwner.profile_image;
    } else {
      profileImageSrc = generateJazziconDataURL(
        this.tokenInfo.owner,
      );
    }
    this.profileImage.src = profileImageSrc;

    if (tokenOwner.wallet_address === UserManager.userWalletAddress) {
      this.editButton.deleteClass("hidden");
    }
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPrice(
      this.tokenInfo.token_address,
      ethers.parseEther("1"),
    );
    this.priceDisplay.text = `${ethers.formatEther(price)} ETH`;
  }

  private async loadBalance() {
    if (UserManager.userWalletAddress) {
      const balance = await new PalTokenContract(this.tokenInfo.token_address)
        .balanceOf(UserManager.userWalletAddress);
      this.balanceDisplay.text = ethers.formatEther(balance);
    }
  }
}
