import { DomNode, el } from "common-dapp-module";
import { ethers } from "ethers";
import UserDetails from "../../data/UserDetails.js";

export default class MemberItem extends DomNode {
  constructor(userDetails: UserDetails, balance: bigint, tokenSymbol: string) {
    super(".member-item");
    this.append(
      el(
        "a.user",
        el("img.profile-image", { src: userDetails.profile_image }),
        el(".name", userDetails.display_name),
      ),
      el(".balance", ethers.formatEther(balance) + " " + tokenSymbol),
    );
  }
}
