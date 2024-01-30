export default interface UserWalletData {
  wallet_address: string;
  total_key_balance: number;
  total_earned_trading_fees: string;
  created_at: string;
  updated_at?: string;
}

export const UserWalletDataSelectQuery = "*, total_earned_trading_fees::text";
