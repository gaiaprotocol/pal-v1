import { DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import MessageForm from "./chatroom/MessageForm.js";
import MessageList from "./chatroom/MessageList.js";

export default class ChatRoom extends DomNode {
  private messageForm: MessageForm | undefined;

  private toFocusForm: boolean = false;
  private toHideForm: boolean = false;

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
      this.messageForm = new MessageForm(list),
    );

    if (this.toFocusForm) {
      this.messageForm.focus();
      this.toFocusForm = false;
    }

    if (this.toHideForm) {
      this.messageForm.hide();
      this.toHideForm = false;
    }
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public focusMessageForm(): void {
    if (this.messageForm) {
      this.messageForm.focus();
    } else {
      this.toFocusForm = true;
    }
  }

  public hideMessageForm(): void {
    if (this.messageForm) {
      this.messageForm.hide();
    } else {
      this.toHideForm = true;
    }
  }

  public showMessageForm(): void {
    if (this.messageForm) {
      this.messageForm.show();
    } else {
      this.toHideForm = false;
    }
  }
}
