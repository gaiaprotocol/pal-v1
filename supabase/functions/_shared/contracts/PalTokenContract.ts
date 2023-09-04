import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import PalTokenArtifact from "./abi/pal/PalToken.json" assert { type: "json" };
import { PalToken } from "./abi/pal/PalToken.ts";

export default class PalTokenContract extends Contract<PalToken> {
  constructor(tokenAddress: string, signer: ethers.Signer) {
    super(tokenAddress, PalTokenArtifact.abi, signer);
  }

  public async name() {
    return await this.ethersContract.name();
  }

  public async symbol() {
    return await this.ethersContract.symbol();
  }

  public async owner() {
    return await this.ethersContract.owner();
  }

  public async balanceOf(address: string) {
    return await this.ethersContract.balanceOf(address);
  }
}
