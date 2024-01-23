import ChatMessage from "@common-module/social/lib/database-interface/ChatMessage.js";
import BlockchainType from "../blockchain/BlockchainType.js";
import ChatMessageSource from "../chat/ChatMessageSource.js";

export default interface TokenChatMessage
  extends ChatMessage<ChatMessageSource> {
  chain: BlockchainType;
  token_address: string;
}
