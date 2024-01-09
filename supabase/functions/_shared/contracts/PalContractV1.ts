import { ethers } from "https://esm.sh/ethers@6.7.0";
import { BlockchainType } from "../blockchain.ts";
import { isDevMode } from "../supabase.ts";
import Contract from "./Contract.ts";
import PalArtifact from "./abi/pal/PalV1.json" assert {
  type: "json",
};
import { Pal } from "./abi/pal/PalV1.ts";

const testnetAddresses: { [chain: string]: string } = {
  [BlockchainType.Base]: "0xcF18D57f24C067C00Fa83CC4e8fE1C134177047A",
};

const addresses: { [chain: string]: string } = {
  [BlockchainType.Base]: "0x6489f919432741965831f731Fa203553eA790614",
};

const testnetDeployBlockNumbers: { [chain: string]: number } = {
  [BlockchainType.Base]: 11731220,
};

const deployBlockNumbers: { [chain: string]: number } = {
  [BlockchainType.Base]: 4246959,
};

export default class PalContractV1 extends Contract<Pal> {
  constructor(chain: BlockchainType, signer: ethers.Signer) {
    super(
      (isDevMode ? testnetAddresses : addresses)[chain],
      PalArtifact.abi,
      signer,
      (isDevMode ? testnetDeployBlockNumbers : deployBlockNumbers)[chain],
    );
    this.eventFilters = {
      SetProtocolFeeDestination: this.ethersContract.filters
        .SetProtocolFeeDestination(),
      SetProtocolFeePercent: this.ethersContract.filters
        .SetProtocolFeePercent(),
      SetTokenOwnerFeePercent: this.ethersContract.filters
        .SetTokenOwnerFeePercent(),
      UserTokenCreated: this.ethersContract.filters.UserTokenCreated(),
      Trade: this.ethersContract.filters.Trade(),
    };
  }
}
