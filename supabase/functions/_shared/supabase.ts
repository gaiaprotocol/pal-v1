import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export default supabase;

export function createUserClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );
}

export const getSignedUser = async (req: Request) => {
  const userSupabase = createUserClient(req);
  const { data: { user } } = await userSupabase.auth.getUser();
  return user;
};

export const isDevMode = Deno.env.get("IS_DEV") === "true";
