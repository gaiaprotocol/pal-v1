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
import ActivityList from "../../component/list/ActivityList.js";
import HolderList from "../../component/list/HolderList.js";
import TokenInfoTabs from "../../component/token-info/TokenInfoTabs.js";
import PalContract from "../../contract/PalContract.js";
import PalTokenContract from "../../contract/PalTokenContract.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";

export default class TokenInfoPopup extends Popup {
  public content: DomNode;

  private profileImage: DomNode<HTMLImageElement>;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;
  private activityList: ActivityList;

  constructor(private tokenInfo: TokenInfo) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".token-info-popup",
        el(
          "h1",
          this.profileImage = el("img.profile-image"),
          el("span.name", tokenInfo.name),
          el("span.symbol", tokenInfo.symbol),
          this.priceDisplay = el("span.price"),
        ),
        el(
          "main",
          el("p", tokenInfo.metadata.description ?? "No description"),
          el(
            ".balance",
            el("img.profile-image", {
              src: UserManager.user?.user_metadata.avatar_url,
            }),
            el("label", "Your Balance"),
            this.balanceDisplay = el("span.balance.loading"),
          ),
          new TokenInfoTabs(),
          new HolderList(tokenInfo.token_address),
          this.activityList = new ActivityList(),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".chat-room-button",
            click: () => {
              Router.go("/" + this.tokenInfo.token_address);
              this.delete();
            },
            title: "Chat Room",
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

    this.loadProfileImage();
    this.loadPrice();
    this.loadBalance();
    this.activityList.load({
      tokenAddresses: [tokenInfo.token_address],
    });
  }

  private async loadProfileImage() {
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
    this.profileImage.domElement.src = profileImageSrc;
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPriceAfterFee(
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
