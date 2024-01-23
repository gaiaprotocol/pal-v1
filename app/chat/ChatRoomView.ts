import { el, View } from "@common-module/app";
import Layout from "../layout/Layout.js";

export default abstract class ChatRoomView extends View {
  constructor(tag: string) {
    super();
    Layout.append(
      this.container = el(tag + ".chat-room-view"),
    );
  }
}
