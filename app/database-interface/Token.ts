import { Author } from "@common-module/social";

export default interface Token {
  chain: string;
  token_address: string;
  owner: Author;
  name: string;
  symbol: string;
  image?: string;
  image_thumb?: string;
  image_stored?: boolean;
  stored_image?: string;
  stored_image_thumb?: string;
  metadata?: any;
  supply: string;
  last_fetched_price: string;
  total_trading_volume: string;
  is_price_up: boolean;
  last_message: string;
  last_message_sent_at: string;
  holder_count: number;
  last_purchased_at: string;
  created_at: string;
  updated_at?: string;

  rank?: number;
}

export const TokenSelectQuery =
  "*, supply::text, last_fetched_price::text, total_trading_volume::text";
