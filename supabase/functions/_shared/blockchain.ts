import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseSepolia,
  optimism,
  optimismGoerli,
} from "npm:viem/chains";
import { isDevMode } from "./supabase.ts";

export enum BlockchainType {
  Ethereum = "ethereum",
  Base = "base",
  Arbitrum = "arbitrum",
  Optimism = "optimism",
}

export const rpcs: { [chain: string]: string } = {
  [BlockchainType.Ethereum]: `https://${
    isDevMode ? "goerli" : "mainnet"
  }.infura.io/v3/${Deno.env.get("INFURA_KEY")}`,
  [BlockchainType.Base]: (isDevMode ? baseSepolia : base).rpcUrls.default
    .http[0],
  [BlockchainType.Arbitrum]:
    (isDevMode ? arbitrumGoerli : arbitrum).rpcUrls.default.http[0],
  [BlockchainType.Optimism]:
    (isDevMode ? optimismGoerli : optimism).rpcUrls.default.http[0],
};
