export default interface UserWalletData {
  wallet_address: string;
  total_token_balance: string;
  total_earned_trading_fees: string;
  created_at: string;
  updated_at?: string;
}

export const UserWalletDataSelectQuery = "*, total_token_balance::text, total_earned_trading_fees::text";
