import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalTokenPriceAggregatorContract from "../_shared/contracts/PalTokenPriceAggregatorContract.ts";
import { response, serveWithOptions } from "../_shared/cors.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const palContract = new PalTokenPriceAggregatorContract(signer);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async () => {
  const { data: tokens } = await supabase.from("pal_tokens").select();
  const tokenAddresses = tokens?.map((token: any) => token.address) ?? [];
  const prices = await palContract.getBulkTokenPrices(tokenAddresses);
  const result: { [address: string]: string } = {};
  for (let i = 0; i < tokenAddresses.length; i++) {
    result[tokenAddresses[i]] = prices[i].toString();
  }
  return response({ prices: result });
});