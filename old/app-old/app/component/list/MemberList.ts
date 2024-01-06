import { DomNode, el } from "@common-module/app";
import SupabaseManager from "../../SupabaseManager.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import UserDetails from "../../data/UserDetails.js";
import ListLoading from "../ListLoading.js";
import MemberItem from "./MemberItem.js";

export default class MemberList extends DomNode {
  private list: DomNode;
  private loadingComponent: ListLoading | undefined;

  constructor() {
    super(".member-list");
    this.append(
      this.list = el("ul", this.loadingComponent = new ListLoading()),
    );
    this.loadingComponent.on("delete", () => this.loadingComponent = undefined);
  }

  public add(
    userDetails: UserDetails,
    balance: bigint,
    symbol: string,
  ): MemberItem {
    const item = new MemberItem(userDetails, balance, symbol)
      .appendTo(this.list);
    return item;
  }

  public async load(tokenInfo: TokenInfo) {
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_token_balances",
    ).select("*, last_fetched_balance::text").eq(
      "token_address",
      tokenInfo.token_address,
    ).gte("last_fetched_balance", tokenInfo.view_token_required);
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const walletAddresses: string[] = [];
      for (const balanceInfo of data as any) {
        walletAddresses.push(balanceInfo.wallet_address);
      }
      await UserDetailsCacher.load(walletAddresses);

      if (!this.deleted) {
        this.list.empty();
        for (const balanceInfo of data as any) {
          const userData = UserDetailsCacher.getCached(
            balanceInfo.wallet_address,
          );
          if (userData) {
            this.add(
              userData,
              BigInt(balanceInfo.last_fetched_balance),
              tokenInfo.symbol,
            );
          }
        }
      }
    } else if (!this.deleted) {
      this.list.empty();
    }
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
