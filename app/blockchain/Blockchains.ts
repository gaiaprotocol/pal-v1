import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
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
    rpc: `https://${
      Env.dev ? "goerli" : "mainnet"
    }.infura.io/v3/${Env.infuraKey}`,
    blockExplorer: (Env.dev ? goerli : mainnet).blockExplorers.default,
  };

  Blockchains[BlockchainType.Base] = {
    chainId: Env.dev ? baseGoerli.id : base.id,
    name: base.name,
    rpc: (Env.dev ? baseGoerli : base).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? baseGoerli : base).blockExplorers.default,
  };

  Blockchains[BlockchainType.Arbitrum] = {
    chainId: Env.dev ? arbitrumGoerli.id : arbitrum.id,
    name: arbitrum.name,
    rpc: (Env.dev ? arbitrumGoerli : arbitrum).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? arbitrumGoerli : arbitrum).blockExplorers.default,
  };

  Blockchains[BlockchainType.Optimism] = {
    chainId: Env.dev ? optimismGoerli.id : optimism.id,
    name: optimism.name,
    rpc: (Env.dev ? optimismGoerli : optimism).rpcUrls.default.http[0],
    blockExplorer: (Env.dev ? optimismGoerli : optimism).blockExplorers.default,
  };
}

const Blockchains: { [chain: string]: BlockchainInfo } = {};
export default Blockchains;
