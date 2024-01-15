CREATE OR REPLACE FUNCTION "public"."get_global_activities_with_users"(
    "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone,
    "max_count" integer DEFAULT 100
) RETURNS TABLE(
    "chain" text,
    "block_number" bigint,
    "log_index" bigint,
    "tx" text,
    "wallet_address" text,
    "token_address" text,
    "activity_name" text,
    "args" text[],
    "created_at" timestamp with time zone,
    "user_id" uuid,
    "user_display_name" text,
    "user_avatar" text,
    "user_avatar_thumb" text,
    "user_stored_avatar" text,
    "user_stored_avatar_thumb" text,
    "user_x_username" text,
    "token_name" text,
    "token_symbol" text,
    "token_image" text
) LANGUAGE "plpgsql" AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.chain,
        a.block_number,
        a.log_index,
        a.tx,
        a.wallet_address,
        a.token_address,
        a.activity_name,
        a.args,
        a.created_at,
        u.user_id as user_id,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        t.name as token_name,
        t.symbol as token_symbol,
        t.image as token_image
    FROM 
        "public"."activities" a
    LEFT JOIN 
        "public"."users_public" u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        "public"."tokens" t ON a.token_address = t.token_address
    WHERE 
        (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END
$$;

ALTER FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
