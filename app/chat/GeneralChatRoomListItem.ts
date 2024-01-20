import { el, Router } from "@common-module/app";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";

export default class GeneralChatRoomListItem extends ChatRoomListItem {
  constructor() {
    super(".general-chat-room-list-item");
    this.append(
      el("h3", "General Chat"),
      this.lastMessageDisplay,
    ).onDom(
      "click",
      () => Router.go("/general"),
    );
  }
}
