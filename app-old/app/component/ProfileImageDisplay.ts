import { DomNode, el, ErrorAlert } from "common-app-module";
import { generateJazziconDataURL } from "common-app-module/lib/component/Jazzicon.js";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";
import UserDetails from "../data/UserDetails.js";
import OnlineUserManager from "../OnlineUserManager.js";
import UserInfoPopup from "../popup/user/UserInfoPopup.js";

export default class ProfileImageDisplay extends DomNode {
  private currentWalletAddress: string | undefined;
  private currentUserDetails: UserDetails | undefined;

  constructor(private options: { isLarge?: boolean; noClick?: boolean } = {}) {
    super("a.profile-image-display.loading");
    if (!options.noClick) {
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
    }
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
      this.src = this.options.isLarge
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
