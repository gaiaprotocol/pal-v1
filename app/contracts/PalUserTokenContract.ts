import BlockchainType from "../blockchain/BlockchainType.js";
import Contract from "./Contract.js";
import { PalUserToken } from "./abi/pal/PalUserToken.js";
import PalUserTokenArtifact from "./abi/pal/PalUserToken.json" assert {
  type: "json",
};

export default class PalUserTokenContract extends Contract<PalUserToken> {
  constructor(chain: BlockchainType, address: string) {
    super(
      PalUserTokenArtifact.abi,
      chain,
      address,
    );
  }

  public async balanceOf(address: string): Promise<bigint> {
    return await this.viewContract.balanceOf(address);
  }

  public async setName(name: string) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.setName(name);
    return tx.wait();
  }

  public async setSymbol(symbol: string) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.setSymbol(symbol);
    return tx.wait();
  }
}
