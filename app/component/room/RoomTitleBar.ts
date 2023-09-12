import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import TokenSummary from "../TokenSummary.js";

export default class RoomTitleBar extends DomNode {
  constructor() {
    super(".room-title-bar");
  }

  public async loadTokenInfo(tokenAddress: string) {
    this.empty();
    const { data, error } = await SupabaseManager.supabase.from(
      "pal_tokens",
    )
      .select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      ).eq("token_address", tokenAddress).single();
    if (error) {
      console.error(error);
      return;
    }
    const tokenInfo = data as any;
    this.empty().append(
      el("h1", tokenInfo.metadata.roomName ?? tokenInfo.name),
      new TokenSummary(tokenInfo),
    );
  }
}
