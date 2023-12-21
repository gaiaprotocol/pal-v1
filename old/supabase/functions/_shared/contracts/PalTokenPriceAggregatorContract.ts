import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import PalTokenPriceAggregatorArtifact from "./abi/pal/PalTokenPriceAggregator.json" assert {
  type: "json"
};
import { PalTokenPriceAggregator } from "./abi/pal/PalTokenPriceAggregator.ts";

export default class PalTokenPriceAggregatorContract
  extends Contract<PalTokenPriceAggregator> {
  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("PAL_TOKEN_PRICE_AGGREGATOR_ADDRESS")!,
      PalTokenPriceAggregatorArtifact.abi,
      signer,
    );
  }

  public async getBulkTokenPrices(tokenAddresses: string[]) {
    return await this.ethersContract.getBulkTokenPrices(tokenAddresses);
  }
}
