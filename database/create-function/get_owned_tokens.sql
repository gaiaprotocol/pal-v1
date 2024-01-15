CREATE OR REPLACE FUNCTION "public"."get_owned_tokens"(
    "p_wallet_address" "text", 
    "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, 
    "max_count" integer DEFAULT 1000
) 
RETURNS TABLE(
    "chain" "text", 
    "token_address" "text", 
    "owner" "text",
    "name" "text", 
    "symbol" "text", 
    "image" "text", 
    "image_thumb" "text",
    "image_stored" boolean,
    "stored_image" "text",
    "stored_image_thumb" "text",
    "metadata" "jsonb", 
    "supply" "numeric", 
    "last_fetched_key_price" "numeric", 
    "total_trading_key_volume" "numeric", 
    "is_price_up" boolean, 
    "last_message" "text", 
    "last_message_sent_at" timestamp with time zone, 
    "holder_count" integer, 
    "last_key_purchased_at" timestamp with time zone, 
    "created_at" timestamp with time zone, 
    "updated_at" timestamp with time zone,
    "owner_user_id" uuid,
    "owner_display_name" text,
    "owner_avatar" text,
    "owner_avatar_thumb" text,
    "owner_stored_avatar" text,
    "owner_stored_avatar_thumb" text,
    "owner_x_username" text
)
LANGUAGE "plpgsql"
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.chain,
        t.token_address,
        t.owner,
        t.name,
        t.symbol,
        t.image,
        t.image_thumb,
        t.image_stored,
        t.stored_image,
        t.stored_image_thumb,
        t.metadata,
        t.supply,
        t.last_fetched_key_price,
        t.total_trading_key_volume,
        t.is_price_up,
        t.last_message,
        t.last_message_sent_at,
        t.holder_count,
        t.last_key_purchased_at,
        t.created_at,
        t.updated_at,
        u.id AS owner_user_id,
        u.display_name AS owner_display_name,
        u.avatar AS owner_avatar,
        u.avatar_thumb AS owner_avatar_thumb,
        u.stored_avatar AS owner_stored_avatar,
        u.stored_avatar_thumb AS owner_stored_avatar_thumb,
        u.x_username AS owner_x_username
    FROM 
        public.tokens t
    JOIN 
        public.token_holders th ON t.token_address = th.token_address AND th.wallet_address = p_wallet_address
    LEFT JOIN 
        "public"."users_public" u ON t.owner = u.wallet_address
    WHERE 
        (last_created_at IS NULL OR t.created_at < last_created_at)
    ORDER BY 
        t.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
