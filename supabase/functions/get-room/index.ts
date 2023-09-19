import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getTokenInfo } from "../_shared/token.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  let { walletAddress, tokenAddress } = await req.json();
  if (!walletAddress) {
    return responseError("No wallet address");
  }
  walletAddress = ethers.getAddress(walletAddress);
  if (!tokenAddress) {
    return responseError("No token address");
  }

  let now = Date.now();

  const tokenInfo = await getTokenInfo(tokenAddress, walletAddress);

  console.log("get token info time taken:", Date.now() - now);
  now = Date.now();

  await Promise.all([
    supabase.from("pal_tokens").upsert({
      token_address: tokenAddress,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      owner: tokenInfo.owner,
      last_fetched_price: tokenInfo.price.toString(),
    }),
    supabase.from("pal_token_balances").upsert({
      token_address: tokenAddress,
      wallet_address: walletAddress,
      last_fetched_balance: tokenInfo.balance.toString(),
    }),
  ]);

  console.log("upsert time taken:", Date.now() - now);

  return response({
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    owner: tokenInfo.owner,
    balance: tokenInfo.balance.toString(),
    price: tokenInfo.price.toString(),
  });
});
