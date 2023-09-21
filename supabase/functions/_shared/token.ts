import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalContract from "./contracts/PalContract.ts";
import PalUserTokenContract from "./contracts/PalUserTokenContract.ts";

export async function getTokenInfo(
  tokenAddress: string,
  walletAddress: string,
) {
  const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
  const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
  const palContract = new PalContract(signer);

  const tokenContract = new PalUserTokenContract(tokenAddress, signer);
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
