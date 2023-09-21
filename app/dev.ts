import { BodyNode, el } from "common-dapp-module";
import Config from "./Config.js";
import SupabaseManager from "./SupabaseManager.js";
import install from "./install.js";

/*Config.devMode = true;
Config.supabaseURL = "http://localhost:54321";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
Config.walletConnectProjectID = "a7ae37d3cf98197d04b720fb165553e0";

Config.palChainId = 84531;
Config.palRPC = "https://goerli.base.org";
Config.palAddress = "0x10e082761dA7C275FE05567D3C1475244C2BfB0e";
Config.tokenHoldingsAggregatorAddress = "0x5E8c983BdbBbCf19f61e16E6e2E79920E4eE3dEF";*/


// Prod Test
Config.supabaseURL = "https://zwsbatwxnlcsgycwiymn.supabase.co";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY";
Config.walletConnectProjectID = "a7ae37d3cf98197d04b720fb165553e0";

Config.palChainId = 8453;
Config.palRPC = "https://mainnet.base.org";
Config.palAddress = "0x6489f919432741965831f731Fa203553eA790614";
Config.tokenHoldingsAggregatorAddress = "0xdC5323d27c611D978E33B65ef9E1eA49fd9a0199";


await install();

/*
BodyNode.append(el("a", "Test", {
  style: {
    position: "fixed",
    left: 0,
    top: 0,
  },
  click: async () => {
    const { data, error } = await SupabaseManager.supabase.auth.signInWithOAuth(
      {
        provider: "twitter",
      },
    );
    console.log(data, error);
  },
}));

const { data, error } = await SupabaseManager.supabase.auth.getUser();
console.log(data, error);
*/