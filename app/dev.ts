import initialize from "./initialize.js";
await initialize({
  dev: true,
  supabaseUrl: "https://htqrhdvdiwmcnslcsocr.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cXJoZHZkaXdtY25zbGNzb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA0OTQyODUsImV4cCI6MjAxNjA3MDI4NX0._r3KAXsSwtNhI4LoWRKDwLpnY-Da-4lwfjpYOndERw8",
  walletConnectProjectId: "a7ae37d3cf98197d04b720fb165553e0",
  messageForWalletLinking: "Link Wallet to Pal",
});
