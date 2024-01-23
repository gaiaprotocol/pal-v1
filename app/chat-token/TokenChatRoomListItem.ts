import { el, Router, StringUtil } from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import { ethers } from "ethers";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";
import Token from "../database-interface/Token.js";

export default class TokenChatRoomListItem extends ChatRoomListItem {
  constructor(token: Token) {
    super(".token-chat-room-list-item", token);

    const tokenImage = el(".token-image");

    AvatarUtil.selectLoadable(tokenImage, [
      token.image_thumb,
      token.stored_image_thumb,
    ]);

    this.append(
      el("header", tokenImage),
      el(
        "main",
        el(
          "h3",
          el("span.name", token.name),
          el(
            "span.owner",
            " by ",
            typeof token.owner === "string"
              ? StringUtil.shortenEthereumAddress(token.owner)
              : token.owner.display_name,
          ),
          el(
            "span.price" + (token.is_price_up ? ".up" : ".down"),
            StringUtil.numberWithCommas(
              ethers.formatEther(token.last_fetched_price),
            ),
            " ETH",
          ),
        ),
        this.lastMessageDisplay,
      ),
    ).onDom(
      "click",
      () =>
        Router.go(
          `/${token.chain}/${token.token_address}`,
          undefined,
          token,
        ),
    );
  }
}
