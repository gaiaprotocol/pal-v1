import { DomNode, el } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import OnlineUserManager from "../OnlineUserManager.js";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";

export default class ProfileImageDisplay extends DomNode {
  private currentWalletAddress: string | undefined;

  constructor(private isLarge = false) {
    super(".profile-image-display.loading");
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
      this.empty().append(img);
      this.deleteClass("loading");
    });
    img.domElement.src = src;
  }
}
