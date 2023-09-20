import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalTokenPriceAggregatorContract from "../_shared/contracts/PalTokenPriceAggregatorContract.ts";
import TokenHoldingsAggregatorContract from "../_shared/contracts/TokenHoldingsAggregatorContract.ts";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getSignedUser } from "../_shared/user.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const palTokenPriceAggregatorContract = new PalTokenPriceAggregatorContract(
  signer,
);
const tokenHoldingsAggregatorContract = new TokenHoldingsAggregatorContract(
  signer,
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const user = await getSignedUser(req);
  if (!user) {
    return responseError("Unauthorized");
  }

  const { data: userWallet } = await supabase
    .from("user_details")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  if (!userWallet) {
    return responseError("No wallet address");
  }

  const { tokenAddresses } = await req.json();
  try {
    if (tokenAddresses) {
      const [prices, balances] = await Promise.all([
        palTokenPriceAggregatorContract.getBulkTokenPrices(
          tokenAddresses,
        ),
        tokenHoldingsAggregatorContract.getERC20Balances(
          userWallet.wallet_address,
          tokenAddresses,
        ),
      ]);

      const promises: Promise<any>[] = [];

      for (const [index, tokenAddress] of tokenAddresses.entries()) {
        promises.push(
          supabase.from("pal_tokens").update({
            last_fetched_price: prices[index].toString(),
          }).eq("token_address", tokenAddress) as any,
        );
      }

      const balanceDataSet = tokenAddresses.map((
        tokenAddress: string,
        index: number,
      ) => ({
        token_address: tokenAddress,
        wallet_address: userWallet.wallet_address,
        last_fetched_balance: balances[index].toString(),
      }));

      promises.push(
        supabase.from("pal_token_balances").upsert(balanceDataSet) as any,
      );

      await Promise.all(promises);
      return response({});
    }
    throw new Error("Invalid request");
  } catch (e) {
    return responseError(e.message);
  }
});
