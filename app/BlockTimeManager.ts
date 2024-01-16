import { ethers } from "ethers";
import Blockchains from "./blockchain/Blockchains.js";

class BlockTimeManager {
  private info: {
    [chain: string]: {
      blockNumber: number;
      blockTime: number;
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
          blockTime: block!.timestamp * 1000,
        };
      }),
    );
  }

  public blockToTime(chain: string, blockNumber: number): number {
    if (!this.info[chain]) throw new Error("Unknown chain");
    const blockTime = Blockchains[chain].blockTime;
    return this.info[chain].blockTime +
      (blockNumber - this.info[chain].blockNumber) * blockTime * 1000;
  }
}

export default new BlockTimeManager();
