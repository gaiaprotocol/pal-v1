import ChatMessage from "@common-module/social/lib/database-interface/ChatMessage.js";
import BlockchainType from "../blockchain/BlockchainType.js";

export default interface TokenChatMessage extends ChatMessage<void> {
  chain: BlockchainType;
  token_address: string;
}
