import { DomNode, ErrorAlert, el } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import OnlineUserManager from "../OnlineUserManager.js";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";
import UserDetails from "../data/UserDetails.js";
import UserInfoPopup from "../popup/user/UserInfoPopup.js";

export default class ProfileImageDisplay extends DomNode {
  private currentWalletAddress: string | undefined;
  private currentUserDetails: UserDetails | undefined;

  constructor(private isLarge = false) {
    super("a.profile-image-display.loading");
    this.onDom("click", () => {
      if (this.currentUserDetails) {
        new UserInfoPopup(this.currentUserDetails);
      } else {
        new ErrorAlert({
          title: "User not found",
          message: "User not found",
        });
      }
    });
    this.onDelegate(
      OnlineUserManager,
      "onlineUsersChanged",
      () => this.checkOnline(),
    );
  }

  private checkOnline() {
    if (
      this.currentWalletAddress &&
      OnlineUserManager.checkOnline(this.currentWalletAddress)
    ) {
      this.addClass("online");
    } else {
      this.deleteClass("online");
    }
  }

  public async load(walletAddress: string) {
    this.currentWalletAddress = walletAddress;
    this.checkOnline();

    const userDetails = await UserDetailsCacher.get(walletAddress);
    this.currentUserDetails = userDetails;

    if (userDetails) {
      this.src = this.isLarge
        ? userDetails.profile_image.replace("_normal", "")
        : userDetails.profile_image;
    } else {
      this.src = generateJazziconDataURL(walletAddress);
    }
  }

  private set src(src: string) {
    const img = el<HTMLImageElement>("img");
    img.onDom("load", () => {
      if (!this.deleted) {
        this.empty().append(img);
        this.deleteClass("loading");
      }
    });
    img.domElement.src = src;
  }
}
