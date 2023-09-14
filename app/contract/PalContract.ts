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
  ): Promise<string | undefined> {
    const writeContract = await this.getWriteContract();
    if (!writeContract) {
      throw new Error("No signer");
    }
    const response = await writeContract.createToken(name, symbol);
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

  public async getBuyPrice(tokenAddress: string, amount: bigint) {
    return this.viewContract.getBuyPrice(tokenAddress, amount);
  }

  public async getSellPrice(tokenAddress: string, amount: bigint) {
    return this.viewContract.getSellPrice(tokenAddress, amount);
  }

  public async getBuyPriceAfterFee(tokenAddress: string, amount: bigint) {
    return this.viewContract.getBuyPriceAfterFee(tokenAddress, amount);
  }

  public async getSellPriceAfterFee(tokenAddress: string, amount: bigint) {
    return this.viewContract.getSellPriceAfterFee(tokenAddress, amount);
  }

  public async buyToken(tokenAddress: string, amount: bigint, value: bigint) {
    const writeContract = await this.getWriteContract();
    if (!writeContract) {
      throw new Error("No signer");
    }
    const response = await writeContract.buyToken(tokenAddress, amount, {
      value,
    });
    return response.wait();
  }

  public async sellToken(tokenAddress: string, amount: bigint) {
    const writeContract = await this.getWriteContract();
    if (!writeContract) {
      throw new Error("No signer");
    }
    const response = await writeContract.sellToken(tokenAddress, amount);
    return response.wait();
  }
}

export default new PalContract();
