import { msg, Supabase } from "@common-module/app";
import { ChatMessageList } from "@common-module/social";
import { RealtimeChannel } from "@supabase/supabase-js";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import MessageLoadingAnimation from "../chat/MessageLoadingAnimation.js";
import PalChatMessageInteractions from "../chat/PalChatMessageInteractions.js";
import GeneralChatMessage from "../database-interface/GeneralChatMessage.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatMessageService from "./GeneralChatMessageService.js";

export default class GeneralChatMessageList
  extends ChatMessageList<ChatMessageSource> {
  private channel: RealtimeChannel;

  constructor() {
    super(
      ".general-chat-message-list",
      {
        storeName: "general-chat-messages",
        signedUserId: PalSignedUserManager.user?.user_id,
        emptyMessage: msg("chat-message-list-empty-message"),
      },
      PalChatMessageInteractions,
      new MessageLoadingAnimation(),
    );

    this.channel = Supabase.client
      .channel("general-chat-message-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "general_chat_messages",
        },
        // The response indicating that a message has been sent arrives before the real-time message itself.
        async (payload: any) => {
          const message = await GeneralChatMessageService.fetchMessage(
            payload.new.id,
          );
          if (message) this.addNewMessage(message);
        },
      )
      .subscribe();
  }

  protected async fetchMessages(): Promise<GeneralChatMessage[]> {
    return await GeneralChatMessageService.fetchMessages();
  }

  public delete() {
    this.channel.unsubscribe();
    super.delete();
  }
}
