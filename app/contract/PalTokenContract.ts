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

  public async balanceOf(address: string): Promise<bigint> {
    return await this.viewContract.balanceOf(address);
  }
}
