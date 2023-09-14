import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getTokenInfo } from "../_shared/token.ts";
import { getSignedUser } from "../_shared/user.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const user = await getSignedUser(req);
  if (!user) {
    return responseError("Unauthorized");
  }

  const { data: userWallets } = await supabase
    .from("user_details")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  if (!userWallets) {
    return responseError("No wallet address");
  }

  const { tokenAddress } = await req.json();
  if (!tokenAddress) {
    return responseError("No token address");
  }

  const tokenInfo = await getTokenInfo(
    tokenAddress,
    userWallets.wallet_address,
  );

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
      wallet_address: userWallets.wallet_address,
      last_fetched_balance: tokenInfo.balance.toString(),
    }),
  ]);

  return response({
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    owner: tokenInfo.owner,
    balance: tokenInfo.balance.toString(),
    price: tokenInfo.price.toString(),
  });
});
