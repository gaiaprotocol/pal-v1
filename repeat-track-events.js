const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY";

for (let i = 0; i < 150; i += 1) {
  const response = await fetch(
    "https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/track-events",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  console.log(await response.text());
}
