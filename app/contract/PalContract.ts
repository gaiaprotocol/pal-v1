import { EventLog } from "ethers";
import Contract from "./Contract.js";
import { Pal } from "./abi/pal/Pal.js";
import PalArtifact from "./abi/pal/Pal.json" assert { type: "json" };

class PalContract extends Contract<Pal> {
  constructor() {
    super(PalArtifact.abi);
  }

  public async createToken(
    name: string,
    symbol: string,
  ): Promise<string> {
    const response = await this.ethersContract.createToken(name, symbol);
    const tx = await response.wait();
    if (!tx) {
      throw new Error("Transaction failed");
    }
    for (const log of tx.logs) {
      if (log instanceof EventLog && log.fragment.name === "TokenCreated") {
        return log.args[1];
      }
    }
    throw new Error("TokenCreated event not found");
  }

  public async getBuyPriceAfterFee(tokenAddress: string, amount: bigint) {
    return this.ethersContract.getBuyPriceAfterFee(tokenAddress, amount);
  }

  public async buyToken(tokenAddress: string, amount: bigint, value: bigint) {
    const response = await this.ethersContract.buyToken(tokenAddress, amount, {
      value,
    });
    return response.wait();
  }
}

export default new PalContract();
