import { BodyNode, DomNode, el, View, ViewParams } from "common-dapp-module";

export default class ChatRoom extends View {
  private container: DomNode;

  constructor(params: ViewParams) {
    super();
    BodyNode.append(
      this.container = el(
        ".chat-room-view",
        el("header", el("h1", "Chat Room")),
        "test",
      ),
    );
    console.log(params);
  }

  public changeParams(params: ViewParams): void {
    console.log(params);
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
