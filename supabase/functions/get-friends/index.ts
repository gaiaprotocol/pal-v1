import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getTwitterAccessToken() {
  console.log(
    `${Deno.env.get("TWITTER_CLIENT_ID")}:${Deno.env.get("TWITTER_SECRET")}`,
  );
  const res = await fetch("https://api.twitter.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Authorization: `Basic ${
        btoa(
          `${Deno.env.get("TWITTER_CLIENT_ID")}:${
            Deno.env.get("TWITTER_SECRET")
          }`,
        )
      }`,
    },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await res.json();
  return access_token;
}

async function getTwitterFriends(userId: string) {
  const token = await getTwitterAccessToken();
  const res = await fetch(
    `https://api.twitter.com/1.1/friends/ids.json?user_id=${userId}&count=5000`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  console.log(await res.json());
}

serveWithOptions(async (req) => {
  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const { data: { user } } = await userSupabase.auth.getUser();
  const twitterUserId = user?.user_metadata.provider_id;
  if (twitterUserId) {
    const friends = await getTwitterFriends(twitterUserId);
    console.log(friends);
  }

  //TODO: Implement after profit is generated

  return response({});
});
