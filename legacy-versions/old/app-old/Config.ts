export default class Config {
  public static devMode: boolean = false;
  public static supabaseURL: string;
  public static supabaseAnonKey: string;
  public static walletConnectProjectID: string;
  public static fcmVapidKey: string;
  public static alwaysOnServerURL: string;

  public static palChainId: number = 1;
  public static palRPC: string;
  public static palAddress: string;
  public static tokenHoldingsAggregatorAddress: string;
}
