import Config from "./Config.js";
import install from "./install.js";

Config.supabaseURL = "https://zwsbatwxnlcsgycwiymn.supabase.co";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY";
Config.walletConnectProjectID = "a7ae37d3cf98197d04b720fb165553e0";

await install();
