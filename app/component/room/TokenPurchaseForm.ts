import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import RoomInfo from "../../data/RoomInfo.js";

export default class TokenPurchaseForm extends DomNode {
  constructor() {
    super(".token-purchase-form");
    this.append(
      el("a.buy-token-button", "Buy Token"),
    );
  }

  public async check(tokenAddress: string, roomInfo: RoomInfo) {
    const { data, error } = await SupabaseManager.supabase.rpc(
      "check_view_granted",
      {
        token_address: tokenAddress,
      },
    );
    if (data === false) {
      this.addClass("show");
    }
  }
}
