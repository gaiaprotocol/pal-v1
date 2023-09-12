import { Button, DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../../SupabaseManager.js";
import { MessageType } from "../../../data/ChatMessage.js";
import UserManager from "../../../user/UserManager.js";
import MessageList from "./MessageList.js";

export default class MessageForm extends DomNode {
  private messageInput: DomNode<HTMLInputElement>;

  constructor(private list: MessageList, tokenAddress: string) {
    super("form.message-form");

    this.append(
      this.messageInput = el("input"),
      new Button({
        title: "Send",
      }),
    );

    this.onDom("submit", async (e) => {
      e.preventDefault();
      const message = this.messageInput.domElement.value;
      if (!message) {
        return;
      }
      this.messageInput.domElement.value = "";
      if (UserManager.user) {
        const item = this.list.add({
          id: -1,
          token_address: tokenAddress,
          message,
          message_type: MessageType.MESSAGE,
          author: UserManager.user.id,
          author_name: UserManager.user.user_metadata.full_name,
          author_avatar_url: UserManager.user.user_metadata.avatar_url,
        });
        item.wait();

        const { data, error } = await SupabaseManager.supabase.from(
          "chat_messages",
        )
          .insert({
            token_address: tokenAddress,
            message,
            message_type: MessageType.MESSAGE,
            author_name: UserManager.user.user_metadata.full_name,
            author_avatar_url: UserManager.user.user_metadata.avatar_url,
          }).select();

        if (error) {
          console.error(error);
        }

        if (data?.[0]) {
          const id = data[0].id;
          this.list.findItem(id)?.delete();
          item.message.id = id;
          item.done();
        }
      }
    });

    setTimeout(() => {
      if (this.messageInput.deleted !== true) {
        this.messageInput.domElement.focus();
      }
    });
  }
}
