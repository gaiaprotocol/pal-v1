CREATE OR REPLACE FUNCTION "public"."get_token_holders"(
    p_chain text,
    p_token_address text,
    last_balance numeric DEFAULT NULL,
    max_count integer DEFAULT 50
) RETURNS TABLE(
    "user_id" uuid,
    "wallet_address" text,
    "total_earned_trading_fees" numeric,
    "display_name" text,
    "avatar" text,
    "avatar_thumb" text,
    "avatar_stored" boolean,
    "stored_avatar" text,
    "stored_avatar_thumb" text,
    "x_username" text,
    "metadata" jsonb,
    "follower_count" integer,
    "following_count" integer,
    "blocked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "balance" text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.user_id,
        u.wallet_address,
        u.total_earned_trading_fees,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.avatar_stored,
        u.stored_avatar,
        u.stored_avatar_thumb,
        u.x_username,
        u.metadata,
        u.follower_count,
        u.following_count,
        u.blocked,
        u.created_at,
        u.updated_at,
        th.last_fetched_balance::text AS balance
    FROM 
        public.users_public u
    INNER JOIN 
        public.token_holders th ON u.wallet_address = th.wallet_address
    WHERE 
        th.chain = p_chain
        AND th.token_address = p_token_address
        AND (last_balance IS NULL OR th.last_fetched_balance > last_balance)
    ORDER BY 
        th.last_fetched_balance DESC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_token_holders"("p_chain" text, "p_token_address" text, "last_balance" numeric, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" text, "p_token_address" text, "last_balance" numeric, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" text, "p_token_address" text, "last_balance" numeric, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" text, "p_token_address" text, "last_balance" numeric, "max_count" integer) TO "service_role";
