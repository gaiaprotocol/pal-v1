import { ethers } from "https://esm.sh/ethers@6.7.0";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase, { getSignedUser } from "../_shared/supabase.ts";

serveWithOptions(async (req) => {
  const { walletAddress, signedMessage } = await req.json();
  if (!walletAddress || !signedMessage) {
    throw new Error("Missing wallet address or signed message");
  }

  const user = await getSignedUser(req);
  if (!user) throw new Error("Unauthorized");

  const { data: nonceDataSet, error: nonceError } = await supabase.from(
    "wallet_linking_nonces",
  ).select().eq("user_id", user.id);
  if (nonceError) throw nonceError;

  const nonceData = nonceDataSet?.[0];
  if (!nonceData) throw new Error("Nonce not found");
  if (nonceData.wallet_address !== walletAddress) {
    throw new Error("Invalid wallet address");
  }

  const verifiedAddress = ethers.verifyMessage(
    `${
      Deno.env.get("MESSAGE_FOR_WALLET_LINKING")
    }\n\nNonce: ${nonceData.nonce}`,
    signedMessage,
  );
  if (walletAddress !== verifiedAddress) throw new Error("Invalid signature");

  // delete old nonce
  await supabase.from("wallet_linking_nonces").delete().eq("user_id", user.id);

  const { error: deleteWalletAddressError } = await supabase.from(
    "users_public",
  ).update(
    { wallet_address: null },
  ).eq("wallet_address", walletAddress);
  if (deleteWalletAddressError) throw deleteWalletAddressError;

  const { error: setWalletAddressError } = await supabase.from("users_public")
    .update({ wallet_address: walletAddress }).eq("user_id", user.id);
  if (setWalletAddressError) throw setWalletAddressError;
});
