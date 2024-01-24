import { Post } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";

export enum PostTarget {
  EVERYONE,
  TOKEN_HOLDERS,
}

export default interface PalPost extends Post {
  target: PostTarget;
  chain?: BlockchainType;
  token_address?: string;
}
