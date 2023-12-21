import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

export const getSignedUser = async (req: Request) => {
  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );
  const { data: { user } } = await userSupabase.auth.getUser();
  return user;
};
