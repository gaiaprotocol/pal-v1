import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import TokenHoldingsAggregatorArtifact from "./abi/token-holdings-aggregator/TokenHoldingsAggregator.json" assert {
  type: "json",
};
import { TokenHoldingsAggregator } from "./abi/token-holdings-aggregator/TokenHoldingsAggregator.ts";

export default class TokenHoldingsAggregatorContract
  extends Contract<TokenHoldingsAggregator> {
  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("TOKEN_HOLDINGS_AGGREGATOR_ADDRESS")!,
      TokenHoldingsAggregatorArtifact.abi,
      signer,
    );
  }

  public async getERC20Balances(
    holder: string,
    tokens: string[],
  ): Promise<bigint[]> {
    return await this.ethersContract.getERC20BalanceList_OneHolder(
      holder,
      tokens,
    );
  }
}
