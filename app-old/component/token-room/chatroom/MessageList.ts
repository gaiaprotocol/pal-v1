import { RealtimeChannel } from "@supabase/supabase-js";
import { ArrayUtil, DomNode, el } from "common-app-module";
import SupabaseManager from "../../../SupabaseManager.js";
import ChatMessage from "../../../data/ChatMessage.js";
import MessageItem from "./MessageItem.js";

export default class MessageList extends DomNode {
  private list: DomNode;
  private items: MessageItem[] = [];

  private _channel: RealtimeChannel;

  constructor(public tokenAddress: string) {
    super(".message-list");
    this.append(this.list = el("ul"));
    this.loadMessages();
    this._channel = SupabaseManager.supabase
      .channel("message-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_chat_messages",
          filter: "token_address=eq." + tokenAddress,
        },
        (payload: any) => {
          this.findItem(payload.new.id)?.delete();
          this.add(payload.new);
        },
      )
      .subscribe();
  }

  private async loadMessages() {
    this.items = [];

    const { data, error } = await SupabaseManager.supabase.from(
      "token_chat_messages",
    )
      .select()
      .eq("token_address", this.tokenAddress)
      .order("created_at", { ascending: false })
      .limit(100);

    for (const message of data?.reverse() ?? []) {
      this.add(message);
    }
  }

  public findItem(id: number) {
    return this.items.find((item) => item.message.id === id);
  }

  public add(message: ChatMessage): MessageItem {
    const item = new MessageItem(message).appendTo(this.list);
    this.items.push(item);
    item.on("uploadImageLoaded", () => this.scrollToBottom());
    item.on("delete", () => ArrayUtil.pull(this.items, item));

    this.scrollToBottom();

    return item;
  }

  public set activities(messages: ChatMessage[]) {
    this.list.empty();
    for (const message of messages) {
      this.add(message);
    }
  }

  public scrollToBottom() {
    this.domElement.scrollTo(
      0,
      this.domElement.scrollHeight,
    );
  }

  public delete() {
    this._channel.unsubscribe();
    super.delete();
  }
}
