import { PostgrestError } from "@supabase/supabase-js";
import { DomNode, el } from "common-dapp-module";
import OnlineUserManager from "../../OnlineUserManager.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserDataCacher from "../../cacher/UserDataCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import TokenItem from "./TokenItem.js";

export enum TokenListFilter {
  Top,
  Trending,
  NewChat,
  Friends,
  OnlineUsers,
  SpecificUser,
}

export default class TokenList extends DomNode {
  private list: DomNode;

  constructor(
    private tokenListFilter: TokenListFilter,
    private walletAddress?: string,
  ) {
    super(".token-list");
    this.append(this.list = el("ul"));
    this.load();
    if (this.tokenListFilter === TokenListFilter.NewChat) {
      this.onDelegate(
        OnlineUserManager,
        "onlineUsersChanged",
        () => this.load(),
      );
    }
  }

  public add(tokenInfo: TokenInfo): TokenItem {
    const item = new TokenItem(tokenInfo).appendTo(this.list);
    return item;
  }

  private async load() {
    let data: TokenInfo[] = [];
    let error: PostgrestError | null = null;

    if (this.tokenListFilter === TokenListFilter.Top) {
      const result = await SupabaseManager.supabase.from(
        "pal_tokens",
      ).select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      ).order("last_fetched_price", { ascending: false }).limit(50);
      if (result.data) {
        data = result.data as any;
      }
      error = result.error;
    } else if (this.tokenListFilter === TokenListFilter.Trending) {
      //TODO:
    } else if (this.tokenListFilter === TokenListFilter.NewChat) {
      const result = await SupabaseManager.supabase.from(
        "pal_tokens",
      ).select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      ).order("last_message_sent_at", { ascending: false }).limit(
        50,
      );
      if (result.data) {
        data = result.data as any;
      }
      error = result.error;
    } else if (this.tokenListFilter === TokenListFilter.Friends) {
      //TODO:
    } else if (this.tokenListFilter === TokenListFilter.OnlineUsers) {
      const ownerWalletAddresses: string[] = OnlineUserManager.onlineUsers.map(
        (onlineUser) => onlineUser.walletAddress,
      );
      const result = await SupabaseManager.supabase.from(
        "pal_tokens",
      ).select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      ).in("owner", ownerWalletAddresses);
      if (result.data) {
        data = result.data as any;
      }
      error = result.error;
    } else if (this.tokenListFilter === TokenListFilter.SpecificUser) {
      const result = await SupabaseManager.supabase.from(
        "pal_tokens",
      ).select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      ).eq("owner", this.walletAddress).limit(50);
      if (result.data) {
        data = result.data as any;
      }
      error = result.error;
    }

    if (error) {
      throw error;
    }

    const ownerWalletAddresses: string[] = [];
    for (const tokenInfo of data) {
      if (!ownerWalletAddresses.includes(tokenInfo.owner)) {
        ownerWalletAddresses.push(tokenInfo.owner);
      }
    }
    await UserDataCacher.getMultipleUserData(ownerWalletAddresses);

    this.list.empty();
    for (const tokenInfo of data) {
      this.add(tokenInfo);
    }
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
