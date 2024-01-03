import { Button, Constants, DomNode, el } from "@common-module/app";
import dayjs from "dayjs";
import { ethers } from "ethers";
import SupabaseManager from "../../SupabaseManager.js";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import BuyTokenPopup from "../../popup/token/BuyTokenPopup.js";
import WalletManager from "../../user/WalletManager.js";
import Icon from "../Icon.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

export default class TokenPurchaseForm extends DomNode {
  private currentTokenAddress: string | undefined;
  private currentViewTokenRequired: string | undefined;

  private profileImage: ProfileImageDisplay;
  private messageDisplay: DomNode;
  private lastMessageSentAtDisplay: DomNode;

  constructor() {
    super(".token-purchase-form");
    this.append(
      this.profileImage = new ProfileImageDisplay(),
      new Icon("lock"),
      this.messageDisplay = el("p.message"),
      new Button({
        tag: ".buy-token-button",
        title: "Buy Token",
        click: async () => {
          if (this.currentTokenAddress) {
            if (!WalletManager.connected) {
              await WalletManager.connect();
            }
            const popup = new BuyTokenPopup(
              this.currentTokenAddress,
              this.currentViewTokenRequired,
            );
            popup.on("buyToken", () => this.fireEvent("buyToken"));
          }
        },
      }),
      this.lastMessageSentAtDisplay = el("p.last-message-sent-at"),
    );
  }

  public async check(tokenAddress: string) {
    const now = Date.now();

    this.deleteClass("show");

    this.currentTokenAddress = tokenAddress;
    const { data, error } = await SupabaseManager.supabase.rpc(
      "check_view_granted",
      {
        parameter_token_address: tokenAddress,
      },
    );

    console.log("check_view_granted time taken:", Date.now() - now);

    if (!error && data !== true) {
      this.addClass("show");
      return true;
    }
    return false;
  }

  public async loadProfileImage(owner: string, symbol: string) {
    this.currentViewTokenRequired = undefined;
    this.profileImage.load(owner);

    const tokenOwner = await UserDetailsCacher.get(owner);
    if (tokenOwner && this.currentTokenAddress) {
      const tokenInfo = await TokenInfoCacher.get(this.currentTokenAddress);
      if (tokenInfo) {
        this.currentViewTokenRequired = tokenInfo.view_token_required;
        this.messageDisplay.empty().append(
          "Hold at least ",
          el("b", ethers.formatEther(tokenInfo.view_token_required)),
          ` ${symbol} to read messages and at least `,
          el("b", ethers.formatEther(tokenInfo.write_token_required)),
          ` ${symbol} to send messages. This was set by ${tokenOwner.display_name}.`,
        );

        this.lastMessageSentAtDisplay.text =
          tokenInfo.last_message_sent_at === Constants.NEGATIVE_INFINITY
            ? ""
            : "Last message sent " + dayjs(
              tokenInfo.last_message_sent_at,
            ).fromNow();
      }
    }
  }
}
