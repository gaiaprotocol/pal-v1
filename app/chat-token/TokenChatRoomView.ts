import { ViewParams } from "@common-module/app";
import { ChatRoomView } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import Token from "../database-interface/Token.js";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenChatMessageForm from "./TokenChatMessageForm.js";
import TokenChatMessageList from "./TokenChatMessageList.js";
import TokenChatRoomHeader from "./TokenChatRoomHeader.js";

export default class TokenChatRoomView extends ChatRoomView<void> {
  protected messageList!: TokenChatMessageList;

  constructor(params: ViewParams, uri: string, data?: any) {
    super(Layout, ".token-chat-room-view");
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
    this.messageList = new TokenChatMessageList(chain, token);
    const form = new TokenChatMessageForm(chain, token);

    form.on(
      "messageSending",
      (tempId, message, files) => {
        if (PalSignedUserManager.user) {
          this.messageList.messageSending(
            tempId,
            undefined,
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
