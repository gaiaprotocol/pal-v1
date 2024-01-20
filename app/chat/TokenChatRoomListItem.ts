import { el, Router } from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
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
      tokenImage,
      el(
        ".info",
        el("h3", token.name),
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
