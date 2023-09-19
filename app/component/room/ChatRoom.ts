import { DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import MessageForm from "./chatroom/MessageForm.js";
import MessageList from "./chatroom/MessageList.js";

export default class ChatRoom extends DomNode {
  private messageForm: MessageForm | undefined;

  constructor() {
    super(".chat-room");
  }

  public async loadMessages(tokenAddress: string) {
    const now = Date.now();

    const { data, error } = await SupabaseManager.supabase.from(
      "token_chat_messages",
    )
      .select().eq(
        "token_address",
        tokenAddress,
      );
    console.log(data, error);

    console.log("loadMessages time taken:", Date.now() - now);

    let list;
    this.empty().append(
      list = new MessageList(tokenAddress),
      this.messageForm = new MessageForm(list, tokenAddress),
    );
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public focusMessageForm(): void {
    this.messageForm?.focus();
  }
}
