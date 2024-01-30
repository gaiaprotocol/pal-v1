export default interface BlockchainInfo {
  chainId: number;
  name: string;
  icon: string;
  rpc: string;
  blockExplorer: {
    name: string;
    url: string;
  };
  blockTime: number;
}
