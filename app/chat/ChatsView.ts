import { el, View } from "@common-module/app";
import Layout from "../layout/Layout.js";
import ChatRoomList from "./ChatRoomList.js";

export default class ChatsView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".chats-view",
        new ChatRoomList(),
      ),
    );
  }
}
