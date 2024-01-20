import { el, Router, Store } from "@common-module/app";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";
import GeneralChatMessageService from "./GeneralChatMessageService.js";

export default class GeneralChatRoomListItem extends ChatRoomListItem {
  private store = new Store("general-chat-room-list-item");

  constructor() {
    super(".general-chat-room-list-item");
    this.append(
      el("h3", "General Chat"),
      this.lastMessageDisplay,
    ).onDom(
      "click",
      () => Router.go("/general"),
    );

    const lastMessage = this.store.get<{
      last_message?: string;
      last_message_sent_at: string;
    }>("cached-last-message");

    if (lastMessage) this.updateLastMessageData(lastMessage);

    this.fetchLastMessage();
  }

  private async fetchLastMessage() {
    const m = await GeneralChatMessageService.fetchLastMessage();
    if (m) {
      this.updateLastMessageData({
        last_message: m.message,
        last_message_sent_at: m.created_at,
      });
      this.store.set("cached-last-message", {
        last_message: m.message,
        last_message_sent_at: m.created_at,
      }, true);
    }
  }
}
