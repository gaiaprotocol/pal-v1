import { Button, DomNode, el } from "common-dapp-module";
import dayjs from "dayjs";
import { ethers } from "ethers";
import Constants from "../../Constants.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import BuyTokenPopup from "../../popup/token/BuyTokenPopup.js";
import Icon from "../Icon.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";
import WalletManager from "../../user/WalletManager.js";

export default class TokenPurchaseForm extends DomNode {
  private currentTokenAddress: string | undefined;

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
            const popup = new BuyTokenPopup(this.currentTokenAddress);
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
    this.profileImage.load(owner);

    const tokenOwner = await UserDetailsCacher.get(owner);
    if (tokenOwner) {
      const { data } = await SupabaseManager.supabase.from(
        "pal_tokens",
      )
        .select(
          Constants.PAL_TOKENS_SELECT_QUERY,
        )
        .eq("token_address", this.currentTokenAddress).single();

      const tokenInfo: TokenInfo | null = data as any;
      if (tokenInfo) {
        this.messageDisplay.empty().append(
          "Hold at least ",
          el("b", ethers.formatEther(tokenInfo.view_token_required)),
          ` ${symbol} to read messages and at least `,
          el("b", ethers.formatEther(tokenInfo.write_token_required)),
          ` ${symbol} to send messages. This was set by ${tokenOwner.display_name}.`,
        );

        this.lastMessageSentAtDisplay.text = !tokenInfo.last_message_sent_at
          ? ""
          : "Last message sent " + dayjs(
            tokenInfo.last_message_sent_at,
          ).fromNow();
      }
    }
  }
}
