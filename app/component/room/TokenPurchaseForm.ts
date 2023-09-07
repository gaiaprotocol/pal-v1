import { Button, DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import RoomInfo from "../../data/RoomInfo.js";
import PalContract from "../../contract/PalContract.js";
import { ethers } from "ethers";
import TradeTokenPopup from "../../popup/token/TradeTokenPopup.js";

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
            /*const price = await PalContract.getBuyPriceAfterFee(
              this.currentTokenAddress,
              ethers.parseEther("1"),
            );
            await PalContract.buyToken(
              this.currentTokenAddress,
              ethers.parseEther("1"),
              price,
            );*/
            new TradeTokenPopup(this.currentTokenAddress);
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
        token_address: tokenAddress,
      },
    );
    if (data === false) {
      this.addClass("show");
    }
  }
}
