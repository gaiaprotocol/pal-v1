import { DomNode, el } from "common-dapp-module";
import ChatMessage from "../../../data/ChatMessage.js";

export default class MessageItem extends DomNode {
  constructor(public message: ChatMessage) {
    super(".message-item");
    this.append(
      el(
        "a.author",
        el("img.profile-image", { src: message.author_avatar_url }),
        el("span.name", message.author_name),
      ),
      el("span.message", message.message),
    );
  }

  public wait() {
    this.addClass("wait");
  }

  public done() {
    this.deleteClass("wait");
  }
}
