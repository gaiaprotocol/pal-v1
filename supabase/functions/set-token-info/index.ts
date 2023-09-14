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

  const { tokenAddress, metadata } = await req.json();
  try {
    if (tokenAddress && metadata) {
      const tokenInfo = await getTokenInfo(
        tokenAddress,
        userWallets.wallet_address,
      );

      if (userWallets.wallet_address !== tokenInfo.owner) {
        throw new Error("Invalid owner");
      }

      const { data, error } = await supabase.from("pal_tokens").upsert({
        token_address: tokenAddress,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        owner: tokenInfo.owner,
        last_fetched_price: tokenInfo.price.toString(),
      }).select();

      if (error) {
        throw error;
      }

      return response(data?.[0]);
    }
    throw new Error("Invalid request");
  } catch (e) {
    return responseError(e.message);
  }
});
