CREATE OR REPLACE FUNCTION "public"."get_post_and_comments"(
        "p_post_id" bigint,
        "last_comment_id" int8 DEFAULT NULL,
        "max_comment_count" integer DEFAULT 50,
        "signed_user_id" "uuid" DEFAULT NULL::"uuid"
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
        "depth" integer
    )
    LANGUAGE "sql"
    AS $$
WITH RECURSIVE ancestors AS (
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        0 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        p.id = p_post_id
    UNION
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        a.depth - 1 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    JOIN 
        ancestors a ON p.id = a.parent
),
comments AS (
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        1 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        p.parent = p_post_id AND
        last_comment_id IS NULL OR p.id < last_comment_id
    ORDER BY p.id
    LIMIT max_comment_count
)
SELECT * FROM ancestors
UNION ALL
SELECT * FROM comments
ORDER BY depth, id;
$$;

ALTER FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "service_role";
