import { ethers } from "ethers";
import Blockchains from "./blockchain/Blockchains.js";

class BlockTimeManager {
  private info: {
    [chain: string]: {
      blockNumber: number;
      initBlockTime: number;
    };
  } = {};

  public async init() {
    await Promise.all(
      Object.keys(Blockchains).map(async (chain) => {
        const provider = new ethers.JsonRpcProvider(
          Blockchains[chain].rpc,
        );
        const block = await provider.getBlock("latest");
        this.info[chain] = {
          blockNumber: block!.number,
          initBlockTime: block!.timestamp * 1000,
        };
      }),
    );
  }

  public blockToTime(chain: string, blockNumber: number): number {
    if (!this.info[chain]) throw new Error("Unknown chain");
    const blockTime = Blockchains[chain].blockTime;
    return this.info[chain].initBlockTime +
      (blockNumber - this.info[chain].blockNumber) * blockTime * 1000;
  }
}

export default new BlockTimeManager();
