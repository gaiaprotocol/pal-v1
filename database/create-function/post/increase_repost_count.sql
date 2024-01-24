CREATE OR REPLACE FUNCTION "public"."increase_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    repost_count = repost_count + 1
  where
    id = new.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_repost_count"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "service_role";
