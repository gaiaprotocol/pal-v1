import Config from "./Config.js";
import install from "./install.js";

Config.supabaseURL = "https://zwsbatwxnlcsgycwiymn.supabase.co";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY";
Config.walletConnectProjectID = "a7ae37d3cf98197d04b720fb165553e0";

Config.palChainId = 8453;
Config.palRPC = "https://mainnet.base.org";
Config.palAddress = "0x6489f919432741965831f731Fa203553eA790614";
Config.tokenHoldingsAggregatorAddress = "0xdC5323d27c611D978E33B65ef9E1eA49fd9a0199";

await install();
