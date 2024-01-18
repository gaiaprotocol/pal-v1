import { DomNode, el, Router, StringUtil } from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import { ethers } from "ethers";
import PalUserPublic from "../database-interface/PalUserPublic.js";

export default class TokenHolderListItem extends DomNode {
  private balanceDisplay: DomNode;

  constructor(
    private user: PalUserPublic & { balance: string },
    symbol: string,
  ) {
    super(".user-list-item");

    const profileImage = el(".profile-image");

    AvatarUtil.selectLoadable(profileImage, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.append(
      el(
        ".info",
        profileImage,
        el(".name", user.display_name),
        this.balanceDisplay = el(".balance"),
      ),
    );
    this.onDom("click", () => Router.go(`/${user.x_username}`));
    this.symbol = symbol;
  }

  public set symbol(symbol: string) {
    this.balanceDisplay.text = `${
      StringUtil.numberWithCommas(ethers.formatEther(this.user.balance))
    } ${symbol}`;
  }
}
