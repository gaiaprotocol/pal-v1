import { Button, DomNode, el } from "common-dapp-module";
import dayjs from "dayjs";
import { ethers } from "ethers";
import Constants from "../../Constants.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserDetailsCacher from "../../cacher/UserDetailsCacher.js";
import RoomInfo from "../../data/RoomInfo.js";
import BuyTokenPopup from "../../popup/token/BuyTokenPopup.js";
import Icon from "../Icon.js";
import ProfileImageDisplay from "../ProfileImageDisplay.js";

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
            const popup = new BuyTokenPopup(this.currentTokenAddress);
            popup.on("buyToken", () => this.fireEvent("buyToken"));
          }
        },
      }),
      this.lastMessageSentAtDisplay = el("p.last-message-sent-at"),
    );
  }

  public async check(tokenAddress: string, roomInfo: RoomInfo) {
    this.deleteClass("show");

    this.loadProfileImage(roomInfo.owner, roomInfo.symbol);

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

  private async loadProfileImage(owner: string, symbol: string) {
    this.profileImage.load(owner);

    const tokenOwner = await UserDetailsCacher.get(owner);
    if (tokenOwner) {
      const { data: tokenData } = await SupabaseManager.supabase.from(
        "pal_tokens",
      )
        .select(
          Constants.PAL_TOKENS_SELECT_QUERY,
        )
        .eq("token_address", this.currentTokenAddress).single();
      if (tokenData) {
        this.messageDisplay.empty().append(
          "Hold at least ",
          el("b", ethers.formatEther((tokenData as any).view_token_required)),
          ` ${symbol} to read messages and at least `,
          el("b", ethers.formatEther((tokenData as any).write_token_required)),
          ` ${symbol} to send messages. This was set by ${tokenOwner.display_name}.`,
        );

        this.lastMessageSentAtDisplay.text =
          !(tokenData as any).last_message_sent_at
            ? ""
            : "Last message sent " + dayjs(
              (tokenData as any).last_message_sent_at,
            ).fromNow();
      }
    }
  }
}
