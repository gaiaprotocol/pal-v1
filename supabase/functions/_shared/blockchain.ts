import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  optimism,
  optimismGoerli,
} from "npm:viem/chains";

export enum BlockchainType {
  Ethereum = "ethereum",
  Base = "base",
  Arbitrum = "arbitrum",
  Optimism = "optimism",
}

const dev = Deno.env.get("IS_DEV") === "true";

export const rpcs: { [chain: string]: string } = {
  [BlockchainType.Ethereum]: `https://${
    dev ? "goerli" : "mainnet"
  }.infura.io/v3/${Deno.env.get("INFURA_KEY")}`,
  [BlockchainType.Base]: (dev ? baseGoerli : base).rpcUrls.default
    .http[0],
  [BlockchainType.Arbitrum]:
    (dev ? arbitrumGoerli : arbitrum).rpcUrls.default.http[0],
  [BlockchainType.Optimism]:
    (dev ? optimismGoerli : optimism).rpcUrls.default.http[0],
};
