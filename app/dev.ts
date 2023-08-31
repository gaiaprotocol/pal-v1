import { BodyNode, el } from "common-dapp-module";
import Config from "./Config.js";
import SupabaseManager from "./SupabaseManager.js";
import install from "./install.js";

Config.devMode = true;
Config.supabaseURL = "http://localhost:54321";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
Config.walletConnectProjectID = "a7ae37d3cf98197d04b720fb165553e0";
Config.palChainId = 84531;
Config.palAddress = "0x10e082761dA7C275FE05567D3C1475244C2BfB0e";

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