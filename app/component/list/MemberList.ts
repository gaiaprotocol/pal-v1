import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import UserDetails from "../../data/UserDetails.js";
import MemberItem from "./MemberItem.js";

export default class MemberList extends DomNode {
  private list: DomNode;

  constructor(private tokenInfo: TokenInfo) {
    super(".member-list");
    this.append(this.list = el("ul"));
    this.load();
  }

  public add(userDetails: UserDetails, balance: bigint): MemberItem {
    const item = new MemberItem(userDetails, balance, this.tokenInfo.symbol)
      .appendTo(this.list);
    return item;
  }

  private async load() {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_token_balances",
    ).select("*, last_fetched_balance::text").eq(
      "token_address",
      this.tokenInfo.token_address,
    ).gte("last_fetched_balance", this.tokenInfo.view_token_required);
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const walletAddresses: string[] = [];
      for (const balanceInfo of data as any) {
        walletAddresses.push(balanceInfo.wallet_address);
      }
      await UserDataCacher.getMultipleUserData(walletAddresses);
      for (const balanceInfo of data as any) {
        const userData = UserDataCacher.getCachedUserData(
          balanceInfo.wallet_address,
        );
        if (userData) {
          this.add(userData, BigInt(balanceInfo.last_fetched_balance));
        }
      }
    }
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
