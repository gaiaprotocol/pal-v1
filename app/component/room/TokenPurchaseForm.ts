import { Button, DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import RoomInfo from "../../data/RoomInfo.js";
import BuyTokenPopup from "../../popup/token/BuyTokenPopup.js";

export default class TokenPurchaseForm extends DomNode {
  private currentTokenAddress: string | undefined;

  constructor() {
    super(".token-purchase-form");
    this.append(
      new Button({
        tag: ".buy-token-button",
        title: "Buy Token",
        click: async () => {
          if (this.currentTokenAddress) {
            new BuyTokenPopup(this.currentTokenAddress);
          }
        },
      }),
    );
  }

  public async check(tokenAddress: string, roomInfo: RoomInfo) {
    this.currentTokenAddress = tokenAddress;
    const { data, error } = await SupabaseManager.supabase.rpc(
      "check_view_granted",
      {
        parameter_token_address: tokenAddress,
      },
    );
    if (!error && data !== true) {
      this.addClass("show");
      return true;
    }
    return false;
  }
}
