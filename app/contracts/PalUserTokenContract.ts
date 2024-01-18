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
}
