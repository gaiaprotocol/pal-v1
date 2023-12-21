import { response, serveWithOptions } from "../_shared/cors.ts";
import supabase, { createUserClient } from "../_shared/supabase.ts";

serveWithOptions(async (req) => {
  const { walletAddress } = await req.json();
  if (!walletAddress) throw new Error("Missing wallet address");

  const userSupabase = createUserClient(req);
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // delete old nonce
  await supabase.from("wallet_linking_nonces").delete().eq("user_id", user.id);

  const { data, error } = await supabase.from("wallet_linking_nonces").insert({
    user_id: user.id,
    wallet_address: walletAddress,
  }).select().single();

  if (error) throw error;
  return response(data);
});
