import { DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import MessageForm from "./chatroom/MessageForm.js";
import MessageList from "./chatroom/MessageList.js";

export default class ChatRoom extends DomNode {
  constructor() {
    super(".chat-room");
  }

  public async loadMessages(tokenAddress: string) {
    const { data, error } = await SupabaseManager.supabase.from("chat_messages")
      .select().eq(
        "token_address",
        tokenAddress,
      );
    console.log(data, error);

    let list;
    this.empty().append(
      list = new MessageList(tokenAddress),
      new MessageForm(list, tokenAddress),
    );
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
