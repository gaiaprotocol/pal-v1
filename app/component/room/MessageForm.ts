import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import { MessageType } from "../../data/ChatMessage.js";

export default class MessageForm extends DomNode {
  private messageInput: DomNode<HTMLInputElement>;

  constructor(tokenAddress: string) {
    super("form.message-form");
    this.append(
      this.messageInput = el("input"),
      el("button", "Send"),
    );
    this.onDom("submit", async (e) => {
      e.preventDefault();
      const message = this.messageInput.domElement.value;
      if (!message) {
        return;
      }
      this.messageInput.domElement.value = "";
      const { data, error } = await SupabaseManager.supabase.from(
        "chat_messages",
      )
        .insert({
          token_address: tokenAddress,
          message,
          message_type: MessageType.MESSAGE,
        });
      console.log(data, error);
    });
  }
}
