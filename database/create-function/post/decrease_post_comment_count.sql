CREATE OR REPLACE FUNCTION "public"."decrease_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF old.parent IS NOT NULL THEN
    update posts
    set
      comment_count = comment_count - 1
    where
      id = old.parent;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_post_comment_count"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "service_role";
