export default interface TokenInfo {
  address: string;
  owner: string;
  name: string;
  symbol: string;
  metadata: {
    description?: string;
  };
  view_token_required: string;
  write_token_required: string;
  last_fetched_price: string;
}
