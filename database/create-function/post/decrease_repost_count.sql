CREATE OR REPLACE FUNCTION "public"."decrease_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    repost_count = repost_count - 1
  where
    id = old.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_repost_count"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "service_role";
