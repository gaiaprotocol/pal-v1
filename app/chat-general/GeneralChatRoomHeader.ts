import { DomNode, el, MaterialIcon } from "@common-module/app";

export default class GeneralChatRoomHeader extends DomNode {
  constructor() {
    super(".general-chat-room-header");
    this.append(
      el("button.back", new MaterialIcon("arrow_back"), {
        click: () => history.back(),
      }),
      el("h1", "General Chat"),
    );
  }
}
