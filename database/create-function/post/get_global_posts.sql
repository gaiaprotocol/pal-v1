CREATE OR REPLACE FUNCTION get_global_posts(
    last_post_id int8 DEFAULT NULL,
    max_count int DEFAULT 50,
    signed_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id int8,
    target int2,
    chain text,
    token_address text,
    author uuid,
    author_display_name text,
    author_avatar text,
    author_avatar_thumb text,
    author_stored_avatar text,
    author_stored_avatar_thumb text,
    author_x_username text,
    message text,
    translated jsonb,
    rich jsonb,
    parent int8,
    comment_count int4,
    repost_count int4,
    like_count int4,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    liked boolean,
    reposted boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.chain,
        p.token_address,
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
        END AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.parent IS NULL AND
        last_post_id IS NULL OR p.id < last_post_id
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "service_role";
