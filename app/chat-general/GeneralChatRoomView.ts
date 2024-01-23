import { ViewParams } from "@common-module/app";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import ChatRoomView from "../chat/ChatRoomView.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatMessageForm from "./GeneralChatMessageForm.js";
import GeneralChatMessageList from "./GeneralChatMessageList.js";
import GeneralChatRoomHeader from "./GeneralChatRoomHeader.js";

export default class GeneralChatRoomView extends ChatRoomView {
  constructor(params: ViewParams, uri: string) {
    super(".general-chat-room-view");
    this.render(uri);
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.render(uri);
  }

  private render(uri: string) {
    this.container.deleteClass("mobile-hidden");
    if (uri === "chats") this.container.addClass("mobile-hidden");

    const header = new GeneralChatRoomHeader();
    const list = new GeneralChatMessageList();
    const form = new GeneralChatMessageForm();

    form.on(
      "messageSending",
      (tempId, message, files) => {
        if (PalSignedUserManager.user) {
          list.messageSending(
            tempId,
            ChatMessageSource.Pal,
            PalSignedUserManager.user,
            message,
            files,
          );
        }
      },
    );
    form.on("messageSent", (tempId, id) => list.messageSent(tempId, id));

    this.container.empty().append(header, list, form);
  }
}
