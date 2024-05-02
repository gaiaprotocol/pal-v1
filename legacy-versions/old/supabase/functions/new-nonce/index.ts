import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user) {
    return responseError("Unauthorized");
  }

  const { walletAddress } = await req.json();
  if (!walletAddress) {
    return responseError("Missing wallet address");
  }

  // delete old nonce
  await supabase
    .from("nonce")
    .delete()
    .eq("id", user.id);

  const { data, error } = await supabase
    .from("nonce")
    .insert({ id: user.id, wallet_address: walletAddress })
    .select();

  if (error) {
    return responseError(error);
  }

  return response(data[0]);
});
