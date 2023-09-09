export default interface TokenInfo {
  token_address: string;
  owner: string;
  name: string;
  symbol: string;
  metadata: {
    roomName?: string;
    description?: string;
  };
  view_token_required: string;
  write_token_required: string;
  last_fetched_price: string;
}
