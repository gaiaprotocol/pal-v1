import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

serveWithOptions(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return responseError("Unauthorized");
  }

  const { walletAddress, signedMessage } = await req.json();
  try {
    if (walletAddress && signedMessage) {
      const { data: nonceData, error: nonceError } = await supabase
        .from("nonce")
        .select()
        .eq("id", walletAddress);

      if (nonceError) {
        throw new Error(nonceError.message);
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
        .eq("id", walletAddress);

      const { error: updateError } = await supabase
        .from("user_wallets")
        .upsert({
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
