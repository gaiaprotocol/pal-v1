import { ChatMessage } from "@common-module/social";
import ChatMessageSource from "../chat/ChatMessageSource.js";

export default interface GeneralChatMessage
  extends ChatMessage<ChatMessageSource> {
}
