import Contract from "./Contract.js";
import { PalToken } from "./abi/pal/PalToken.js";
import PalTokenArtifact from "./abi/pal/PalToken.json" assert { type: "json" };

export default class PalTokenContract extends Contract<PalToken> {
  constructor(address: string) {
    super(PalTokenArtifact.abi);
    this.init(address);
  }

  public async name(): Promise<string> {
    return await this.viewContract.name();
  }

  public async symbol(): Promise<string> {
    return await this.viewContract.symbol();
  }

  public async totalSupply(): Promise<bigint> {
    return await this.viewContract.totalSupply();
  }

  public async balanceOf(address: string): Promise<bigint> {
    return await this.viewContract.balanceOf(address);
  }

  public async setName(name: string) {
    const writeContract = await this.getWriteContract();
    if (!writeContract) {
      throw new Error("No signer");
    }
    const tx = await writeContract.setName(name);
    return tx.wait();
  }

  public async setSymbol(symbol: string) {
    const writeContract = await this.getWriteContract();
    if (!writeContract) {
      throw new Error("No signer");
    }
    const tx = await writeContract.setSymbol(symbol);
    return tx.wait();
  }
}
