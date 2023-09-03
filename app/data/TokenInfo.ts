export default interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  metadata: {
    description?: string;
  };
}
