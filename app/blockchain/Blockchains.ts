import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
} from "viem/chains";
import Env from "../Env.js";
import BlockchainInfo from "./BlockchainInfo.js";
import BlockchainType from "./BlockchainType.js";

export function initBlockchains() {
  Blockchains[BlockchainType.Ethereum] = {
    chainId: Env.dev ? goerli.id : mainnet.id,
    name: mainnet.name,
    icon: "/images/chain/ethereum.svg",
    rpc: `https://${
      Env.dev ? "goerli" : "mainnet"
    }.infura.io/v3/${Env.infuraKey}`,
    blockExplorer: (Env.dev ? goerli : mainnet).blockExplorers.default,
    blockTime: 12.05,
  };

  Blockchains[BlockchainType.Base] = {
    chainId: Env.dev ? baseSepolia.id : base.id,
    name: base.name,
    icon: "/images/chain/base.svg",
    rpc: (Env.dev ? baseSepolia : base).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? baseSepolia : base).blockExplorers.default,
    blockTime: 2,
  };

  Blockchains[BlockchainType.Arbitrum] = {
    chainId: Env.dev ? arbitrumGoerli.id : arbitrum.id,
    name: arbitrum.name,
    icon: "/images/chain/arbitrum.svg",
    rpc: (Env.dev ? arbitrumGoerli : arbitrum).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? arbitrumGoerli : arbitrum).blockExplorers.default,
    blockTime: 0.26,
  };

  Blockchains[BlockchainType.Optimism] = {
    chainId: Env.dev ? optimismGoerli.id : optimism.id,
    name: optimism.name,
    icon: "/images/chain/optimism.svg",
    rpc: (Env.dev ? optimismGoerli : optimism).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? optimismGoerli : optimism).blockExplorers.default,
    blockTime: 2,
  };
}

const Blockchains: { [chain: string]: BlockchainInfo } = {};
export default Blockchains;
