import { ViewParams } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import ChatRoomView from "../chat/ChatRoomView.js";
import Token from "../database-interface/Token.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenChatMessageForm from "./TokenChatMessageForm.js";
import TokenChatMessageList from "./TokenChatMessageList.js";
import TokenChatRoomHeader from "./TokenChatRoomHeader.js";

export default class TokenChatRoomView extends ChatRoomView {
  constructor(params: ViewParams, uri: string, data?: any) {
    super(".token-chat-room-view");
    this.render(params.chain as BlockchainType, params.tokenAddress!, data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(params.chain as BlockchainType, params.tokenAddress!, data);
  }

  private async render(
    chain: BlockchainType,
    token: string,
    previewToken?: Token,
  ) {
    const header = new TokenChatRoomHeader(chain, token, previewToken);
    const list = new TokenChatMessageList(chain, token);
    const form = new TokenChatMessageForm(chain, token);

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
