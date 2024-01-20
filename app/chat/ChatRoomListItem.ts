import { Constants, DateUtil, DomNode, el } from "@common-module/app";

export default abstract class ChatRoomListItem extends DomNode {
  private _lastMessageDisplay?: DomNode;

  constructor(
    tag: string,
    private lastMessageData?: {
      last_message?: string;
      last_message_sent_at: string;
    },
  ) {
    super(tag + ".chat-room-list-item");
  }

  protected get lastMessageDisplay() {
    this._lastMessageDisplay = el(".last-message");
    if (this.lastMessageData) this.updateLastMessageData(this.lastMessageData);
    return this._lastMessageDisplay;
  }

  public updateLastMessageData(lastMessageData: {
    last_message?: string;
    last_message_sent_at: string;
  }) {
    this.lastMessageData = lastMessageData;
    this._lastMessageDisplay?.empty().append(
      el(".message", this.lastMessageData.last_message ?? ""),
      el(
        ".sent-at",
        this.lastMessageData.last_message_sent_at ===
            Constants.NEGATIVE_INFINITY
          ? ""
          : DateUtil.fromNow(this.lastMessageData.last_message_sent_at),
      ),
    );
  }
}
