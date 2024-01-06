export default interface BlockchainInfo {
  chainId: number;
  name: string;
  rpc: string;
  blockExplorer: {
    name: string;
    url: string;
  };
}
