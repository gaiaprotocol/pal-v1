import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import PalUserTokenArtifact from "./abi/pal/PalUserToken.json" assert {
  type: "json",
};
import { PalUserToken } from "./abi/pal/PalUserToken.ts";

export default class PalUserTokenContract extends Contract<PalUserToken> {
  constructor(tokenAddress: string, signer: ethers.Signer) {
    super(tokenAddress, PalUserTokenArtifact.abi, signer);
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
