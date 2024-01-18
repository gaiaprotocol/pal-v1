import { DomNode, el, StringUtil } from "@common-module/app";
import { ethers } from "ethers";
import PalUserPublic from "../database-interface/PalUserPublic.js";
import UserListItem from "../user/user-list/UserListItem.js";

export default class TokenHolderListItem extends UserListItem {
  private balanceDisplay: DomNode;

  constructor(
    private user: PalUserPublic & { balance: string },
    symbol: string,
  ) {
    super(user);
    this.balanceDisplay = el(".balance").appendTo(this);
    this.symbol = symbol;
  }

  public set symbol(symbol: string) {
    this.balanceDisplay.text = `${
      StringUtil.numberWithCommas(ethers.formatEther(this.user.balance))
    } ${symbol}`;
  }
}
