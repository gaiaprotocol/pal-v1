import initialize from "./initialize.js";
await initialize({
  //dev: true,
  dev: false,

  supabaseUrl: "https://zwsbatwxnlcsgycwiymn.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY",

  walletConnectProjectId: "a7ae37d3cf98197d04b720fb165553e0",
  infuraKey: "b23059a837a64db4b8b2ac203f0e67a9",

  messageForWalletLinking: "Link Wallet to Pal",
});
