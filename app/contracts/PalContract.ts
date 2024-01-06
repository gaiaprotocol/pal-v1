import Env from "../Env.js";
import BlockchainType from "../blockchain/BlockchainType.js";
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
  [BlockchainType.Optimism]: "0x1640C880E14F8913bA71644F6812eE58EAeF412F",
};

export default class PalContract extends Contract<Pal> {
  constructor(chain: BlockchainType) {
    super(
      PalArtifact.abi,
      chain,
      (Env.dev ? testnetAddresses : addresses)[chain],
    );
  }
}
