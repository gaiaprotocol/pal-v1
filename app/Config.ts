export default interface Config {
  dev: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  walletConnectProjectId: string;
  messageForWalletLinking: string;
}
