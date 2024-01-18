import { Author } from "@common-module/social";

export default interface TokenOwner extends Author {
  wallet_address: string;
}
