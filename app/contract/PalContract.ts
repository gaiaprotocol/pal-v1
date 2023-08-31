import Contract from "./Contract.js";
import { Pal } from "./abi/pal/Pal.js";
import PalArtifact from "./abi/pal/Pal.json" assert { type: "json" };

class PalContract extends Contract<Pal> {
  constructor() {
    super(PalArtifact.abi);
  }

  public async createToken(name: string, symbol: string): Promise<void> {
    await this.ethersContract.createToken(name, symbol);
  }
}

export default new PalContract();
