import Contract from "./Contract.js";
import { TokenHoldingsAggregator } from "./abi/token-holdings-aggregator/TokenHoldingsAggregator.js";
import TokenHoldingsAggregatorArtifact from "./abi/token-holdings-aggregator/TokenHoldingsAggregator.json" assert {
  type: "json"
};

class TokenHoldingsAggregatorContract
  extends Contract<TokenHoldingsAggregator> {
  constructor() {
    super(TokenHoldingsAggregatorArtifact.abi);
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

export default new TokenHoldingsAggregatorContract();
