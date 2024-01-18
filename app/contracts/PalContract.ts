import Env from "../Env.js";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import Contract from "./Contract.js";
import { Pal } from "./abi/pal/Pal.js";
import PalArtifact from "./abi/pal/Pal.json" assert {
  type: "json",
};

const testnetAddresses: { [chain: string]: string } = {
  [BlockchainType.Base]: "0xcF18D57f24C067C00Fa83CC4e8fE1C134177047A",
};

const addresses: { [chain: string]: string } = {
  [BlockchainType.Base]: "0x6489f919432741965831f731Fa203553eA790614",
  [BlockchainType.Arbitrum]: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  //[BlockchainType.Optimism]: "0x1640C880E14F8913bA71644F6812eE58EAeF412F",
};

export function getDeployedBlockchainsForPal(): BlockchainType[] {
  return Object.keys(Env.dev ? testnetAddresses : addresses).map((chain) =>
    chain as BlockchainType
  );
}

export default class PalContract extends Contract<Pal> {
  constructor(chain: BlockchainType) {
    super(
      PalArtifact.abi,
      chain,
      (Env.dev ? testnetAddresses : addresses)[chain],
    );
  }

  public async createToken(name: string, symbol: string) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.createToken(name, symbol);
    const receipt = await tx.wait();

    if (!receipt) throw new Error("No receipt");
    if (!PalSignedUserManager.user) throw new Error("No user");

    const events = await writeContract.queryFilter(
      writeContract.filters.UserTokenCreated(
        PalSignedUserManager.user.wallet_address,
      ),
      receipt.blockNumber,
      receipt.blockNumber,
    );
    if (!events || events.length === 0) throw new Error("No events");
    return events[0].args?.[1];
  }

  public async getBuyPriceAfterFee(tokenAddress: string, amount: bigint) {
    return await this.viewContract.getBuyPriceAfterFee(tokenAddress, amount);
  }

  public async buyToken(tokenAddress: string, amount: bigint) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.buyToken(tokenAddress, amount, "0x", {
      value: await this.getBuyPriceAfterFee(tokenAddress, amount),
    });
    return tx.wait();
  }

  public async sellToken(tokenAddress: string, amount: bigint) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.sellToken(tokenAddress, amount, "0x");
    return tx.wait();
  }
}
