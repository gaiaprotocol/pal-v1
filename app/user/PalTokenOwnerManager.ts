import PalTokenContract from "../contract/PalTokenContract.js";

class PalTokenOwnerManager {
  private ownedTokenContract: PalTokenContract | undefined;

  public tokenName: string | undefined;
  public tokenSymbol: string | undefined;

  public async init(address: string) {
    this.ownedTokenContract = new PalTokenContract(address);
    const promises: Promise<void>[] = [];
    promises.push((async () => {
      this.tokenName = await this.ownedTokenContract?.name();
    })());
    promises.push((async () => {
      this.tokenSymbol = await this.ownedTokenContract?.symbol();
    })());
    await Promise.all(promises);
  }
}

export default new PalTokenOwnerManager();
