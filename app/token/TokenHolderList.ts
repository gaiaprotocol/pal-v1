import { msg } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalUserPublic from "../database-interface/PalUserPublic.js";
import PalUserService from "../user/PalUserService.js";
import UserList from "../user/user-list/UserList.js";
import TokenHolderListItem from "./TokenHolderListItem.js";

export default class TokenHolderList
  extends UserList<(PalUserPublic & { balance: string })> {
  private lastBalance: string | undefined;
  public children: TokenHolderListItem[] = [];

  constructor(
    private chain: BlockchainType,
    private token: string,
    private _symbol: string,
  ) {
    super(".token-holder-list", {
      emptyMessage: msg("token-holder-list-empty-message"),
    });
  }

  public set symbol(symbol: string) {
    this._symbol = symbol;
    for (const child of this.children) {
      child.symbol = symbol;
    }
  }

  protected addUserItem(user: PalUserPublic & { balance: string }) {
    new TokenHolderListItem(user, this._symbol).appendTo(this);
  }

  protected async fetchUsers(): Promise<
    (PalUserPublic & { balance: string })[]
  > {
    const holders = await PalUserService.fetchTokenHolders(
      this.chain,
      this.token,
      this.lastBalance,
    );
    console.log(holders);
    this.lastBalance = holders[holders.length - 1]?.balance;
    return holders;
  }
}
