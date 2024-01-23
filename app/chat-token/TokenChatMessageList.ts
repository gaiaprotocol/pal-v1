import { msg, Supabase } from "@common-module/app";
import { ChatMessageList } from "@common-module/social";
import { RealtimeChannel } from "@supabase/supabase-js";
import BlockchainType from "../blockchain/BlockchainType.js";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import MessageLoadingAnimation from "../chat/MessageLoadingAnimation.js";
import PalChatMessageInteractions from "../chat/PalChatMessageInteractions.js";
import TokenChatMessage from "../database-interface/TokenChatMessage.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenChatMessageService from "./TokenChatMessageService.js";

export default class TokenChatMessageList
  extends ChatMessageList<ChatMessageSource> {
  private channel: RealtimeChannel;

  constructor(private chain: BlockchainType, private tokenAddress: string) {
    super(
      ".token-chat-message-list",
      {
        storeName: `token-${chain}-${tokenAddress}-chat-messages`,
        signedUserId: PalSignedUserManager.user?.user_id,
        emptyMessage: msg("chat-message-list-empty-message"),
      },
      PalChatMessageInteractions,
      new MessageLoadingAnimation(),
    );

    this.channel = Supabase.client
      .channel(`token-${chain}-${tokenAddress}-chat-message-changes`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_chat_messages",
          filter: "token_address=eq." + tokenAddress,
        },
        // The response indicating that a message has been sent arrives before the real-time message itself.
        async (payload: any) => {
          const message = await TokenChatMessageService.fetchMessage(
            payload.new.id,
          );
          if (message?.chain === chain) this.addNewMessage(message);
        },
      )
      .subscribe();
  }

  protected async fetchMessages(): Promise<TokenChatMessage[]> {
    return await TokenChatMessageService.fetchMessages(
      this.chain,
      this.tokenAddress,
    );
  }

  public delete() {
    this.channel.unsubscribe();
    super.delete();
  }
}
