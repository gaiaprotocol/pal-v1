import { DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import TokenSummary from "../TokenSummary.js";

export default class RoomTitleBar extends DomNode {
  constructor() {
    super(".room-title-bar");
  }

  public async loadTokenInfo(tokenAddress: string) {
    this.empty();
    const { data: tokenInfo, error } = await SupabaseManager.supabase.from(
      "pal_tokens",
    )
      .select(
        "*",
      ).eq("token_address", tokenAddress).single();
    if (error) {
      console.error(error);
      return;
    }
    this.empty().append(new TokenSummary(tokenInfo));
  }
}
