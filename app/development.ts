import initialize from "./initialize.js";
await initialize({
  dev: true,

  supabaseUrl: "http://localhost:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",

  walletConnectProjectId: "a7ae37d3cf98197d04b720fb165553e0",
  infuraKey: "b23059a837a64db4b8b2ac203f0e67a9",

  messageForWalletLinking: "Link Wallet to Pal",
});
