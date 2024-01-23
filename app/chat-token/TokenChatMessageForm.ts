import { ChatMessageForm } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenChatMessageService from "./TokenChatMessageService.js";

export default class TokenChatMessageForm extends ChatMessageForm {
  constructor(private chain: BlockchainType, private tokenAddress: string) {
    super(".token-chat-message-form");
  }

  protected async sendMessage(message: string, files: File[]) {
    if (!PalSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("You must be signed in to send messages");
    }
    const data = await TokenChatMessageService.sendMessage(
      this.chain,
      this.tokenAddress,
      message,
      files,
    );
    return data.id;
  }
}
