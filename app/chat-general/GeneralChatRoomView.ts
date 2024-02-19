import { ViewParams } from "@common-module/app";
import { ChatRoomView } from "@common-module/social";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatMessageForm from "./GeneralChatMessageForm.js";
import GeneralChatMessageList from "./GeneralChatMessageList.js";
import GeneralChatRoomHeader from "./GeneralChatRoomHeader.js";

export default class GeneralChatRoomView
  extends ChatRoomView<ChatMessageSource> {
  protected messageList!: GeneralChatMessageList;

  constructor(params: ViewParams, uri: string) {
    super(Layout, ".general-chat-room-view");
    this.render(uri);
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.render(uri);
  }

  private render(uri: string) {
    this.container.deleteClass("mobile-hidden");
    if (uri === "chats") this.container.addClass("mobile-hidden");

    const header = new GeneralChatRoomHeader();
    this.messageList = new GeneralChatMessageList();
    const form = new GeneralChatMessageForm();

    form.on(
      "messageSending",
      (tempId, message, files) => {
        if (PalSignedUserManager.user) {
          this.messageList.messageSending(
            tempId,
            ChatMessageSource.Pal,
            PalSignedUserManager.user,
            message,
            files,
          );
        }
      },
    );
    form.on(
      "messageSent",
      (tempId, id) => this.messageList.messageSent(tempId, id),
    );

    this.container.empty().append(header, this.messageList, form);
  }
}
