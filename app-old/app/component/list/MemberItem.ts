import { DomNode, el } from "@common-module/app";
import { ethers } from "ethers";
import UserDetails from "../../data/UserDetails.js";
import UserInfoPopup from "../../popup/user/UserInfoPopup.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class MemberItem extends DomNode {
  private profileImage: ProfileImageDisplay;

  constructor(userDetails: UserDetails, balance: bigint, tokenSymbol: string) {
    super(".member-item");
    this.append(
      el(
        "a.user",
        this.profileImage = new ProfileImageDisplay(),
        el(".name", userDetails.display_name),
        { click: () => new UserInfoPopup(userDetails) },
      ),
      el(".balance", ethers.formatEther(balance) + " " + tokenSymbol),
    );
    this.profileImage.load(userDetails.wallet_address);
  }
}
