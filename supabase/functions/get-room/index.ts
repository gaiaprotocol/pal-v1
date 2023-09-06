import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalContract from "../_shared/contracts/PalContract.ts";
import PalTokenContract from "../_shared/contracts/PalTokenContract.ts";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getSignedUser } from "../_shared/user.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const palContract = new PalContract(signer);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getTokenInfo(
  tokenAddress: string,
  walletAddress: string,
) {
  const tokenContract = new PalTokenContract(tokenAddress, signer);
  const [name, symbol, owner, balance, price] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.owner(),
    tokenContract.balanceOf(walletAddress),
    palContract.getBuyPriceAfterFee(
      tokenAddress,
      ethers.parseEther("1"),
    ),
  ]);
  return { name, symbol, owner, balance, price };
}

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
      address: tokenAddress,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      owner: tokenInfo.owner,
      last_fetched_price: tokenInfo.price.toString(),
    }),
    supabase.from("pal_token_balances").upsert({
      token: tokenAddress,
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
