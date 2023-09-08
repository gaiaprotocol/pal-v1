import { DomNode } from "common-dapp-module";
import ChatMessage from "../../../data/ChatMessage.js";

export default class MessageItem extends DomNode {
  constructor(public message: ChatMessage) {
    super(".message-item");
    this.append(
      message.message,
    );
  }
}
