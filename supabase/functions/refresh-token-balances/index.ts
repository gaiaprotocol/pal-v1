import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getSignedUser } from "../_shared/user.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const user = await getSignedUser(req);
  if (!user) {
    return responseError("Unauthorized");
  }

  //TODO: implement
  throw new Error("Not implemented");
});
