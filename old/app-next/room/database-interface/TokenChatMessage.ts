import ChatMessage from "./ChatMessage.js";

export default interface TokenChatMessage extends ChatMessage {
  chain: string;
  token_address: string;
}
