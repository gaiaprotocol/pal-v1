CREATE OR REPLACE FUNCTION "public"."get_reposts"(
        "p_user_id" "uuid",
        "last_reposted_at" timestamp with time zone DEFAULT NULL::timestamp with time zone,
        "max_count" integer DEFAULT 50
    ) RETURNS TABLE(
        "id" bigint,
        "target" smallint,
        "chain" "text",
        "token_address" "text",
        "token_name" "text",
        "token_symbol" "text",
        "token_image_thumb" "text",
        "author" "uuid",
        "author_display_name" "text",
        "author_avatar" "text",
        "author_avatar_thumb" "text",
        "author_stored_avatar" "text",
        "author_stored_avatar_thumb" "text",
        "author_x_username" "text",
        "message" "text",
        "translated" "jsonb",
        "rich" "jsonb",
        "parent" bigint,
        "comment_count" integer,
        "repost_count" integer,
        "like_count" integer,
        "created_at" timestamp with time zone,
        "updated_at" timestamp with time zone,
        "liked" boolean,
        "reposted" boolean,
        "repost_created_at" timestamp with time zone
    ) LANGUAGE "plpgsql" AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.chain,
        p.token_address,
        t.name,
        t.symbol,
        t.image_thumb,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
        u.x_username,
        p.message,
        p.translated,
        p.rich,
        p.parent,
        p.comment_count,
        p.repost_count,
        p.like_count,
        p.created_at,
        p.updated_at,
        EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id) AS liked,
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted,
        r.created_at
    FROM 
        reposts r
    INNER JOIN 
        posts p ON r.post_id = p.id
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        r.user_id = p_user_id
        AND (last_reposted_at IS NULL OR r.created_at > last_reposted_at)
    ORDER BY 
        r.created_at ASC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "service_role";
