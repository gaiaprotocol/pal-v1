CREATE OR REPLACE FUNCTION "public"."get_top_tokens"(
    "last_rank" integer DEFAULT NULL,
    "max_count" integer DEFAULT 10
)
RETURNS TABLE(
    "rank" integer,
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
    "last_fetched_price" "numeric", 
    "total_trading_volume" "numeric", 
    "is_price_up" boolean, 
    "last_message" "text", 
    "last_message_sent_at" timestamp with time zone, 
    "holder_count" integer, 
    "last_purchased_at" timestamp with time zone, 
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
DECLARE
    row_rank integer;
BEGIN
    row_rank := COALESCE(last_rank, 0);
    RETURN QUERY
    SELECT
        (row_number() OVER (ORDER BY t.last_fetched_price DESC) + row_rank)::integer AS rank,
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
        t.last_fetched_price,
        t.total_trading_volume,
        t.is_price_up,
        t.last_message,
        t.last_message_sent_at,
        t.holder_count,
        t.last_purchased_at,
        t.created_at,
        t.updated_at,
        u.user_id AS owner_user_id,
        u.display_name AS owner_display_name,
        u.avatar AS owner_avatar,
        u.avatar_thumb AS owner_avatar_thumb,
        u.stored_avatar AS owner_stored_avatar,
        u.stored_avatar_thumb AS owner_stored_avatar_thumb,
        u.x_username AS owner_x_username
    FROM 
        public.tokens t
    LEFT JOIN 
        "public"."users_public" u ON t.owner = u.wallet_address
    ORDER BY 
        t.last_fetched_price DESC
    OFFSET 
        row_rank
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_top_tokens"(integer, integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_top_tokens"(integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_tokens"(integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_tokens"(integer, integer) TO "service_role";
