import { Author } from "@common-module/social";
import PreviewToken from "./PreviewToken.js";

export default interface Activity {
  chain: string;
  block_number: number;
  log_index: number;
  tx: string;
  wallet_address: string;
  token_address: string;
  activity_name: string;
  args: string[];
  created_at: string;

  token?: PreviewToken;
  user?: Author;
}
