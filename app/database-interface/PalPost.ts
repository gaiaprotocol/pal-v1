import { Post } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";

export enum PostTarget {
  EVERYONE,
  TOKEN_HOLDERS,
}

export default interface PalPost extends Post {
  target: PostTarget;
  target_details?: {
    token_name?: string;
    token_symbol?: string;
    token_image_thumb?: string;
  };
  chain?: BlockchainType;
  token_address?: string;
}
