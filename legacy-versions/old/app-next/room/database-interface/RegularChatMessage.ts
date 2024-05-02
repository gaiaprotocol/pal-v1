import ChatMessage from "./ChatMessage.js";

export default interface RegularChatMessage extends ChatMessage {
  topic: string;
}
