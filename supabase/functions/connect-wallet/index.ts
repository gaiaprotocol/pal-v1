import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
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

  const { walletAddress, signedMessage } = await req.json();
  try {
    if (walletAddress && signedMessage) {
      const { data: nonceData, error: nonceError } = await supabase
        .from("nonce")
        .select()
        .eq("id", user.id);

      if (nonceError) {
        throw new Error(nonceError.message);
      }

      if (!nonceData || !nonceData[0]) {
        throw new Error("Nonce not found");
      }

      if (nonceData[0]?.wallet_address !== walletAddress) {
        throw new Error("Invalid wallet address");
      }

      const verifiedAddress = ethers.verifyMessage(
        `Connect to Pal\nNonce: ${nonceData[0]?.nonce}`,
        signedMessage,
      );

      if (walletAddress !== verifiedAddress) {
        throw new Error("Invalid signature");
      }

      // Delete nonce
      await supabase
        .from("nonce")
        .delete()
        .eq("id", user.id);

      const { error: updateError } = await supabase
        .from("user_wallets")
        .upsert({
          id: user.id,
          wallet_address: walletAddress,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return response({});
    }
    throw new Error("Invalid request");
  } catch (e) {
    return responseError(e.message);
  }
});
