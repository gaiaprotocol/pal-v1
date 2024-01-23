import { ChatMessageForm } from "@common-module/social";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatMessageService from "./GeneralChatMessageService.js";

export default class GeneralChatMessageForm extends ChatMessageForm {
  constructor() {
    super(".general-chat-message-form");
  }

  protected async sendMessage(message: string, files: File[]) {
    if (!PalSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("You must be signed in to send messages");
    }
    const data = await GeneralChatMessageService.sendMessage(
      message,
      files,
    );
    return data.id;
  }
}
