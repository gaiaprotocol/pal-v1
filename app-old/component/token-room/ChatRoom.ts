import { DomNode } from "common-dapp-module";
import SupabaseManager from "../../SupabaseManager.js";
import MessageForm from "./chatroom/MessageForm.js";
import MessageList from "./chatroom/MessageList.js";

export default class ChatRoom extends DomNode {
  private list: MessageList | undefined;
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

    this.empty().append(
      this.list = new MessageList(tokenAddress),
      this.messageForm = new MessageForm(this.list),
    );

    if (this.toFocusForm) {
      this.messageForm.focus();
      this.toFocusForm = false;
    }

    if (this.toHideForm) {
      this.messageForm.hide();
      this.toHideForm = false;
    }

    this.messageForm.on("buyToken", () => this.fireEvent("buyToken"));
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public focusMessageForm(): void {
    this.toFocusForm = true;
    if (this.messageForm) {
      this.messageForm.focus();
    }
  }

  public hideMessageForm(): void {
    this.toHideForm = true;
    if (this.messageForm) {
      this.messageForm.hide();
    }
  }

  public showMessageForm(): void {
    this.toHideForm = false;
    if (this.messageForm) {
      this.messageForm.show();
    }
  }

  public scrollToBottom() {
    this.list?.scrollToBottom();
  }
}
