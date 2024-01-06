import Contract from "./Contract.js";
import { PalUserToken } from "./abi/pal/PalUserToken.js";
import PalUserTokenArtifact from "./abi/pal/PalUserToken.json" assert {
  type: "json",
};

export default class PalUserTokenContract extends Contract<PalUserToken> {
  constructor(address: string) {
    super(PalUserTokenArtifact.abi);
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
