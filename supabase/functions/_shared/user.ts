import { ethers } from "https://esm.sh/ethers@6.7.0";
import supabase from "./supabase.ts";

export const getUserWalletAddress = async (userId: string) => {
  const { data, error } = await supabase.from("users_public").select(
    "wallet_address",
  ).eq("user_id", userId);
  if (error) throw error;
  const walletAddress = data?.[0]?.wallet_address;
  return walletAddress ? ethers.getAddress(walletAddress) : undefined;
};
