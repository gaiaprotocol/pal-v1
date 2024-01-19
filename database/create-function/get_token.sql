CREATE OR REPLACE FUNCTION "public"."get_token"(
    "p_chain" "text",
    "p_token_address" "text"
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
    "supply" "text", 
    "last_fetched_price" "text", 
    "total_trading_volume" "text", 
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
        t.supply::text,
        t.last_fetched_price::text,
        t.total_trading_volume::text,
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
    WHERE 
        t.chain = p_chain AND t.token_address = p_token_address;
END;
$$;

ALTER FUNCTION "public"."get_token"("text", "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_token"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_token"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token"("text", "text") TO "service_role";
