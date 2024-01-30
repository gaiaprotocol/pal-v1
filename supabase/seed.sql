
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."check_view_granted"("parameter_token_address" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$begin return auth.role() = 'authenticated'::text
and (
   (
      (
         SELECT pal_tokens.owner
         FROM pal_tokens
         WHERE (pal_tokens.token_address = parameter_token_address)
      ) = (
         SELECT user_details.wallet_address
         FROM user_details
         WHERE (user_details.id = auth.uid())
      )
   )
   or (
      (
         SELECT pal_tokens.view_token_required
         FROM pal_tokens
         WHERE (pal_tokens.token_address = parameter_token_address)
      ) <= (
         SELECT pal_token_balances.last_fetched_balance
         FROM pal_token_balances
         WHERE (
               (pal_token_balances.token_address = parameter_token_address)
               AND (
                  pal_token_balances.wallet_address = (
                     SELECT user_details.wallet_address
                     FROM user_details
                     WHERE (user_details.id = auth.uid())
                  )
               )
            )
      )
   )
);
end;$$;

ALTER FUNCTION "public"."check_view_granted"("parameter_token_address" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_write_granted"("parameter_token_address" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$begin return auth.role() = 'authenticated'::text
and (
   (
      (
         SELECT pal_tokens.owner
         FROM pal_tokens
         WHERE (pal_tokens.token_address = parameter_token_address)
      ) = (
         SELECT user_details.wallet_address
         FROM user_details
         WHERE (user_details.id = auth.uid())
      )
   )
   or (
      (
         SELECT pal_tokens.write_token_required
         FROM pal_tokens
         WHERE (pal_tokens.token_address = parameter_token_address)
      ) <= (
         SELECT pal_token_balances.last_fetched_balance
         FROM pal_token_balances
         WHERE (
               (pal_token_balances.token_address = parameter_token_address)
               AND (
                  pal_token_balances.wallet_address = (
                     SELECT user_details.wallet_address
                     FROM user_details
                     WHERE (user_details.id = auth.uid())
                  )
               )
            )
      )
   )
);
end;$$;

ALTER FUNCTION "public"."check_write_granted"("parameter_token_address" "text") OWNER TO "postgres";

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

CREATE OR REPLACE FUNCTION "public"."decrease_post_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    like_count = like_count - 1
  where
    id = old.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_post_like_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrease_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    repost_count = repost_count - 1
  where
    id = old.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_repost_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrement_token_favorite_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update pal_tokens
  set
    favorite_count = favorite_count - 1
  where
    chain = 'base' and
    token_address = old.token_address;
  return null;
end;$$;

ALTER FUNCTION "public"."decrement_token_favorite_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        POSITION(lower(search_string) IN lower(p.message)) > 0
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    INNER JOIN 
        follows f ON p.author = f.followee_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        f.follower_id = p_user_id
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_global_activities"("last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "block_number" bigint, "log_index" bigint, "tx" "text", "wallet_address" "text", "token_address" "text", "activity_name" "text", "args" "text"[], "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "token_name" "text", "token_symbol" "text", "token_image" "text", "token_image_thumb" "text", "token_image_stored" boolean, "token_stored_image" "text", "token_stored_image_thumb" "text")
    LANGUAGE "plpgsql"
    AS $$
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
        t.image as token_image,
        t.image_thumb as token_image_thumb,
        t.image_stored as token_image_stored,
        t.stored_image as token_stored_image,
        t.stored_image_thumb as token_stored_image_thumb
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

ALTER FUNCTION "public"."get_global_activities"("last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "block_number" bigint, "log_index" bigint, "tx" "text", "wallet_address" "text", "token_address" "text", "activity_name" "text", "args" "text"[], "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "token_name" "text", "token_symbol" "text", "token_image" "text", "token_image_thumb" "text", "token_image_stored" boolean, "token_stored_image" "text", "token_stored_image_thumb" "text")
    LANGUAGE "plpgsql"
    AS $$
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
        t.image as token_image,
        t.image_thumb as token_image_thumb,
        t.image_stored as token_image_stored,
        t.stored_image as token_stored_image,
        t.stored_image_thumb as token_stored_image_thumb
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

CREATE OR REPLACE FUNCTION "public"."get_global_posts"("last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        p.parent IS NULL AND
        last_post_id IS NULL OR p.id < last_post_id
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_held_or_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_wallet_address" "text", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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
        u.wallet_address AS owner_wallet_address,
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
        (t.owner = p_wallet_address OR th.wallet_address = p_wallet_address)
        AND (last_created_at IS NULL OR t.created_at < last_created_at)
    ORDER BY 
        t.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_held_or_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "like_created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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
        pl.created_at AS like_created_at
    FROM 
        post_likes pl
    INNER JOIN 
        posts p ON pl.post_id = p.id
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        pl.user_id = p_user_id
        AND (last_liked_at IS NULL OR pl.created_at > last_liked_at)
    ORDER BY 
        pl.created_at ASC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_new_tokens"("last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 1000) RETURNS TABLE("chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_wallet_address" "text", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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
        u.wallet_address AS owner_wallet_address,
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
        (last_created_at IS NULL OR t.created_at > last_created_at)
    ORDER BY 
        t.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_new_tokens"("last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 1000) RETURNS TABLE("chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_wallet_address" "text", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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
        u.wallet_address AS owner_wallet_address,
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

CREATE OR REPLACE FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint DEFAULT NULL::bigint, "max_comment_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "depth" integer)
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

CREATE OR REPLACE FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "repost_created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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

CREATE OR REPLACE FUNCTION "public"."get_token"("p_chain" "text", "p_token_address" "text") RETURNS TABLE("chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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

ALTER FUNCTION "public"."get_token"("p_chain" "text", "p_token_address" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_token_activities"("p_chain" "text", "p_token_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "block_number" bigint, "log_index" bigint, "tx" "text", "wallet_address" "text", "activity_name" "text", "args" "text"[], "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "token_name" "text", "token_symbol" "text", "token_image" "text", "token_image_thumb" "text", "token_image_stored" boolean, "token_stored_image" "text", "token_stored_image_thumb" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.chain,
        a.block_number,
        a.log_index,
        a.tx,
        a.wallet_address,
        a.activity_name,
        a.args,
        a.created_at,
        u.user_id,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        t.name as token_name,
        t.symbol as token_symbol,
        t.image as token_image,
        t.image_thumb as token_image_thumb,
        t.image_stored as token_image_stored,
        t.stored_image as token_stored_image,
        t.stored_image_thumb as token_stored_image_thumb
    FROM 
        "public"."activities" a
    LEFT JOIN 
        "public"."users_public" u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        "public"."tokens" t ON a.token_address = t.token_address
    WHERE 
        a.chain = p_chain
        AND a.token_address = p_token_address
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_token_activities"("p_chain" "text", "p_token_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_token_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "block_number" bigint, "log_index" bigint, "tx" "text", "wallet_address" "text", "token_address" "text", "activity_name" "text", "args" "text"[], "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "token_name" "text", "token_symbol" "text", "token_image" "text", "token_image_thumb" "text", "token_image_stored" boolean, "token_stored_image" "text", "token_stored_image_thumb" "text")
    LANGUAGE "plpgsql"
    AS $$
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
        u.user_id,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        t.name as token_name,
        t.symbol as token_symbol,
        t.image as token_image,
        t.image_thumb as token_image_thumb,
        t.image_stored as token_image_stored,
        t.stored_image as token_stored_image,
        t.stored_image_thumb as token_stored_image_thumb
    FROM 
        "public"."activities" a
    INNER JOIN 
        "public"."token_holders" th ON a.wallet_address = th.wallet_address
    LEFT JOIN 
        "public"."users_public" u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        "public"."tokens" t ON a.token_address = t.token_address
    WHERE 
        th.token_address = a.token_address
        AND th.wallet_address = p_wallet_address
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END
$$;

ALTER FUNCTION "public"."get_token_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_token_held_activities_with_users"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("chain" "text", "block_number" bigint, "log_index" bigint, "tx" "text", "wallet_address" "text", "token_address" "text", "activity_name" "text", "args" "text"[], "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "token_name" "text", "token_symbol" "text", "token_image" "text", "token_image_thumb" "text", "token_image_stored" boolean, "token_stored_image" "text", "token_stored_image_thumb" "text")
    LANGUAGE "plpgsql"
    AS $$
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
        u.user_id,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        t.name as token_name,
        t.symbol as token_symbol,
        t.image as token_image,
        t.image_thumb as token_image_thumb,
        t.image_stored as token_image_stored,
        t.stored_image as token_stored_image,
        t.stored_image_thumb as token_stored_image_thumb
    FROM 
        "public"."activities" a
    INNER JOIN 
        "public"."token_holders" th ON a.wallet_address = th.wallet_address
    LEFT JOIN 
        "public"."users_public" u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        "public"."tokens" t ON a.token_address = t.token_address
    WHERE 
        th.token_address = a.token_address
        AND th.wallet_address = p_wallet_address
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END
$$;

ALTER FUNCTION "public"."get_token_held_activities_with_users"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_token_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    INNER JOIN 
        token_holders th ON p.chain = th.chain AND p.token_address = th.token_address AND u.wallet_address = th.wallet_address
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        th.wallet_address = p_wallet_address
        AND th.last_fetched_balance > 0
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_token_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_token_holders"("p_chain" "text", "p_token_address" "text", "last_balance" numeric DEFAULT NULL::numeric, "max_count" integer DEFAULT 50) RETURNS TABLE("user_id" "uuid", "wallet_address" "text", "total_earned_trading_fees" numeric, "display_name" "text", "avatar" "text", "avatar_thumb" "text", "avatar_stored" boolean, "stored_avatar" "text", "stored_avatar_thumb" "text", "x_username" "text", "metadata" "jsonb", "follower_count" integer, "following_count" integer, "blocked" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "balance" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_token_holders"("p_chain" "text", "p_token_address" "text", "last_balance" numeric, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_top_tokens"("last_rank" integer DEFAULT NULL::integer, "max_count" integer DEFAULT 10) RETURNS TABLE("rank" integer, "chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_wallet_address" "text", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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
        u.wallet_address AS owner_wallet_address,
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

ALTER FUNCTION "public"."get_top_tokens"("last_rank" integer, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_trending_tokens"("p_last_purchased_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 1000) RETURNS TABLE("chain" "text", "token_address" "text", "owner" "text", "name" "text", "symbol" "text", "image" "text", "image_thumb" "text", "image_stored" boolean, "stored_image" "text", "stored_image_thumb" "text", "metadata" "jsonb", "supply" "text", "last_fetched_price" "text", "total_trading_volume" "text", "is_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "holder_count" integer, "last_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "owner_user_id" "uuid", "owner_wallet_address" "text", "owner_display_name" "text", "owner_avatar" "text", "owner_avatar_thumb" "text", "owner_stored_avatar" "text", "owner_stored_avatar_thumb" "text", "owner_x_username" "text")
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
        u.wallet_address AS owner_wallet_address,
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
        (p_last_purchased_at IS NULL OR t.last_purchased_at > p_last_purchased_at)
    ORDER BY 
        t.last_purchased_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_trending_tokens"("p_last_purchased_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        p.author = p_user_id
        AND p.parent IS NOT NULL
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "chain" "text", "token_address" "text", "token_name" "text", "token_symbol" "text", "token_image_thumb" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    LEFT JOIN 
        tokens t ON p.chain = t.chain AND p.token_address = t.token_address
    WHERE 
        p.author = p_user_id
        AND p.parent IS NULL
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF new.parent IS NOT NULL THEN
    update posts
    set
      comment_count = comment_count + 1
    where
      id = new.parent;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_post_comment_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_post_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    like_count = like_count + 1
  where
    id = new.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_post_like_count"() OWNER TO "postgres";

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

CREATE OR REPLACE FUNCTION "public"."increment_token_favorite_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update pal_tokens
  set
    favorite_count = favorite_count + 1
  where
    chain = 'base' and
    token_address = new.token_address;
  return null;
end;$$;

ALTER FUNCTION "public"."increment_token_favorite_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increment_trading_fees_earned"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF new.event_type = 1 THEN
    update pal_tokens
    set
      trading_fees_earned = trading_fees_earned + new.args[7]::numeric
    where
      chain = 'base' and
      token_address = new.args[2];
    update user_details
    set
      trading_fees_earned = trading_fees_earned + new.args[7]::numeric
    where
      wallet_address = new.args[1];
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."increment_trading_fees_earned"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."new_pal_token"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF new.event_type = 0 THEN
    insert into pal_tokens (chain, token_address, owner, name, symbol) values (
      'base', new.args[2], new.args[1], new.args[3], new.args[4]
    ) ON CONFLICT (chain, token_address)
    DO NOTHING;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."new_pal_token"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."parse_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_receiver UUID;
    v_triggerer UUID;
    owner_data RECORD;
BEGIN
    IF new.event_name = 'UserTokenCreated' THEN
        
        -- add activity
        insert into activities (
            chain, block_number, log_index, tx, wallet_address, token_address, activity_name, args
        ) values (
            new.chain, new.block_number, new.log_index, new.tx, new.args[1], new.args[2], new.event_name, new.args
        );

        SELECT user_id, avatar, avatar_thumb, avatar_stored, stored_avatar, stored_avatar_thumb
        INTO owner_data
        FROM users_public 
        WHERE wallet_address = new.args[1];

        IF FOUND THEN
            
            -- add token info
            insert into tokens (
                chain, token_address, owner, name, symbol, image, image_thumb, image_stored, stored_image, stored_image_thumb
            ) values (
                new.chain, new.args[2], new.args[1], new.args[3], new.args[4], owner_data.avatar, owner_data.avatar_thumb, owner_data.avatar_stored, owner_data.stored_avatar, owner_data.stored_avatar_thumb
            );
            
            -- notify
            insert into notifications (
                user_id, type, chain, token_address
            ) values (
                owner_data.user_id, 0, new.chain, new.args[2]
            );
        ELSE
            -- add token info
            insert into tokens (
                chain, token_address, owner, name, symbol
            ) values (
                new.chain, new.args[2], new.args[1], new.args[3], new.args[4]
            );
        END IF;

    ELSIF new.event_name = 'Trade' THEN

        -- add activity
        insert into activities (
            chain, block_number, log_index, tx, wallet_address, token_address, activity_name, args
        ) values (
            new.chain, new.block_number, new.log_index, new.tx, new.args[1], new.args[2], new.event_name, new.args
        );

        -- notify
        v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = (
            SELECT owner FROM tokens WHERE chain = new.chain AND token_address = new.args[2]
        ));
        v_triggerer := (SELECT user_id FROM users_public WHERE wallet_address = new.args[1]);
        IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
            insert into notifications (
                user_id, triggerer, type, chain, token_address, amount
            ) values (
                v_receiver, v_triggerer, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END, new.chain, new.args[2], new.args[4]::numeric
            );
        END IF;

        -- buy
        IF new.args[3] = 'true' THEN
            
            -- update token info
            update tokens set
                supply = CASE WHEN new.chain = 'base' AND new.block_number < 8865668 THEN new.args[8]::numeric ELSE new.args[9]::numeric END,
                last_fetched_key_price = new.args[5]::numeric,
                total_trading_key_volume = total_trading_key_volume + new.args[5]::numeric,
                is_price_up = true,
                last_key_purchased_at = now()
            where chain = new.chain and token_address = new.args[2];

            -- update token holder info
            insert into token_holders (
                chain, token_address, wallet_address, last_fetched_balance
            ) values (
                new.chain, new.args[2], new.args[1], new.args[4]::numeric
            ) on conflict (chain, token_address, wallet_address) do update
                set last_fetched_balance = token_holders.last_fetched_balance + new.args[4]::numeric;
            
            -- if token holder is new, add to token holder count
            IF NOT FOUND THEN
                update tokens set
                    holders = holders + 1
                where chain = new.chain and token_address = new.args[2];
            END IF;
            
            -- update wallet's total key balance
            insert into user_wallets (
                wallet_address, total_key_balance
            ) values (
                new.args[1], new.args[4]::numeric
            ) on conflict (wallet_address) do update
                set total_key_balance = user_wallets.total_key_balance + new.args[4]::numeric;

        -- sell
        ELSE
            -- update token info
            update tokens set
                supply = CASE WHEN new.chain = 'base' AND new.block_number < 8865668 THEN new.args[8]::numeric ELSE new.args[9]::numeric END,
                last_fetched_key_price = new.args[5]::numeric,
                total_trading_key_volume = total_trading_key_volume + new.args[5]::numeric,
                is_price_up = false
            where chain = new.chain and token_address = new.args[2];

            -- update token holder info
            WITH updated AS (
                UPDATE token_holders
                SET last_fetched_balance = last_fetched_balance - new.args[4]::numeric
                WHERE chain = new.chain
                AND token_address = new.args[2]
                AND wallet_address = new.args[1]
                RETURNING wallet_address, last_fetched_balance
            )
            DELETE FROM token_holders
            WHERE (wallet_address, last_fetched_balance) IN (
                SELECT wallet_address, last_fetched_balance FROM updated WHERE last_fetched_balance = 0
            );

            -- if token holder is gone, subtract from token holder count
            IF FOUND THEN
                update tokens set
                    holders = holders - 1
                where chain = new.chain and token_address = new.args[2];
            END IF;
            
            -- update wallet's total key balance
            update user_wallets set
                total_key_balance = total_key_balance - new.args[4]::numeric
            where wallet_address = new.args[1];
        END IF;
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_contract_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_token_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update tokens
    set
        last_message = (SELECT display_name FROM public.users_public WHERE user_id = new.author) || ': ' || new.message,
        last_message_sent_at = now()
    where
        chain = new.chain and
        token_address = new.token_address;
  return null;
end;$$;

ALTER FUNCTION "public"."set_token_last_message"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  new.updated_at := now();
  RETURN new;
END;$$;

ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_user_metadata_to_public"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if strpos(new.raw_user_meta_data ->> 'iss', 'twitter') > 0 then
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored, x_username)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      case 
        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
        else
          new.raw_user_meta_data ->> 'avatar_url'
      end,
      new.raw_user_meta_data ->> 'avatar_url',
      false,
      new.raw_user_meta_data ->> 'user_name'
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = case 
        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
        else
          new.raw_user_meta_data ->> 'avatar_url'
      end,
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false,
      x_username = new.raw_user_meta_data ->> 'user_name';
  else
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      false
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = new.raw_user_meta_data ->> 'avatar_url',
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false;
  end if;
  return new;
end;
$$;

ALTER FUNCTION "public"."set_user_metadata_to_public"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_price_trend"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF NEW.last_fetched_price > OLD.last_fetched_price THEN
    NEW.is_price_up := TRUE;
  ELSIF NEW.last_fetched_price < OLD.last_fetched_price THEN
    NEW.is_price_up := FALSE;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_price_trend"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."activities" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "tx" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "activity_name" "text" NOT NULL,
    "args" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."activities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."token_chat_messages" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "token_address" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text",
    "rich" "jsonb",
    "translated" "jsonb",
    "chain" "text" NOT NULL
);

ALTER TABLE "public"."token_chat_messages" OWNER TO "postgres";

ALTER TABLE "public"."token_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."contract_events" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "tx" "text" NOT NULL,
    "event_name" "text" NOT NULL,
    "args" "text"[],
    "wallet_address" "text",
    "token_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."contract_events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."follows" (
    "follower_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "followed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."follows" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."general_chat_messages" (
    "id" bigint NOT NULL,
    "source" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "external_author_id" "text",
    "external_author_name" "text",
    "external_author_avatar" "text",
    "message" "text",
    "external_message_id" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."general_chat_messages" OWNER TO "postgres";

ALTER TABLE "public"."general_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."general_chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "triggerer" "uuid",
    "type" smallint NOT NULL,
    "chain" "text",
    "token_address" "text",
    "amount" numeric,
    "post_id" bigint,
    "post_message" "text",
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."old_pal_token_balances" (
    "token_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "chain" "text" DEFAULT 'base'::"text" NOT NULL
);

ALTER TABLE "public"."old_pal_token_balances" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."old_pal_tokens" (
    "token_address" "text" NOT NULL,
    "owner" "text" NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "view_token_required" numeric DEFAULT '1000000000000000000'::numeric NOT NULL,
    "write_token_required" numeric DEFAULT '1000000000000000000'::numeric NOT NULL,
    "last_fetched_price" numeric DEFAULT '68750000000000'::numeric NOT NULL,
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "hiding" boolean DEFAULT false NOT NULL,
    "trading_fees_earned" numeric DEFAULT '0'::numeric NOT NULL,
    "last_message" "text",
    "is_price_up" boolean,
    "favorite_count" integer DEFAULT 0 NOT NULL,
    "chain" "text" DEFAULT 'base'::"text" NOT NULL,
    "trading_volume" numeric DEFAULT '0'::numeric NOT NULL
);

ALTER TABLE "public"."old_pal_tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."post_likes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "target" smallint,
    "chain" "text",
    "token_address" "text",
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text" NOT NULL,
    "translated" "jsonb",
    "rich" "jsonb",
    "parent" bigint,
    "comment_count" integer DEFAULT 0 NOT NULL,
    "repost_count" integer DEFAULT 0 NOT NULL,
    "like_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."reposts" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reposts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."token_holders" (
    "chain" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."token_holders" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tokens" (
    "chain" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "owner" "text" NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "image" "text",
    "metadata" "jsonb",
    "supply" numeric DEFAULT '0'::numeric NOT NULL,
    "last_fetched_price" numeric DEFAULT '68750000000000'::numeric NOT NULL,
    "total_trading_volume" numeric DEFAULT '0'::numeric NOT NULL,
    "is_price_up" boolean,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "holder_count" integer DEFAULT 0 NOT NULL,
    "last_purchased_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "image_thumb" "text",
    "image_stored" boolean DEFAULT false NOT NULL,
    "stored_image" "text",
    "stored_image_thumb" "text",
    "view_token_required" numeric DEFAULT '1000000000000000000'::numeric NOT NULL,
    "write_token_required" numeric DEFAULT '1000000000000000000'::numeric NOT NULL
);

ALTER TABLE "public"."tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tracked_event_blocks" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."tracked_event_blocks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_wallets" (
    "wallet_address" "text" NOT NULL,
    "total_key_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."user_wallets" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users_public" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wallet_address" "text",
    "metadata" "jsonb",
    "avatar" "text",
    "display_name" "text",
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "avatar_thumb" "text",
    "avatar_stored" boolean DEFAULT false NOT NULL,
    "stored_avatar" "text",
    "stored_avatar_thumb" "text",
    "x_username" "text",
    "follower_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "blocked" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."users_public" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."wallet_linking_nonces" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."wallet_linking_nonces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("chain", "block_number", "log_index");

ALTER TABLE ONLY "public"."token_chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contract_events"
    ADD CONSTRAINT "contract_events_pkey" PRIMARY KEY ("chain", "block_number", "log_index");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "followee_id");

ALTER TABLE ONLY "public"."general_chat_messages"
    ADD CONSTRAINT "general_chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."old_pal_token_balances"
    ADD CONSTRAINT "pal_token_balances_pkey" PRIMARY KEY ("token_address", "wallet_address", "chain");

ALTER TABLE ONLY "public"."old_pal_tokens"
    ADD CONSTRAINT "pal_tokens_pkey" PRIMARY KEY ("token_address", "chain");

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."token_holders"
    ADD CONSTRAINT "token_holders_pkey" PRIMARY KEY ("chain", "token_address", "wallet_address");

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("chain", "token_address");

ALTER TABLE ONLY "public"."tracked_event_blocks"
    ADD CONSTRAINT "tracked_event_blocks_pkey" PRIMARY KEY ("chain");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "user_wallets_wallet_address_key" UNIQUE ("wallet_address");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_wallet_address_key" UNIQUE ("wallet_address");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."user_wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("wallet_address");

CREATE OR REPLACE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();

CREATE OR REPLACE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();

CREATE OR REPLACE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();

CREATE OR REPLACE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();

CREATE OR REPLACE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();

CREATE OR REPLACE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();

CREATE OR REPLACE TRIGGER "parse_contract_event" AFTER INSERT ON "public"."contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."parse_contract_event"();

CREATE OR REPLACE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_token_last_message" AFTER INSERT ON "public"."token_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_token_last_message"();

CREATE OR REPLACE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "update_price_trend" BEFORE UPDATE ON "public"."old_pal_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_price_trend"();

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."general_chat_messages"
    ADD CONSTRAINT "general_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_triggerer_fkey" FOREIGN KEY ("triggerer") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."token_chat_messages"
    ADD CONSTRAINT "token_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow anon select" ON "public"."old_pal_token_balances" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."old_pal_tokens" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."users_public" FOR SELECT USING (true);

CREATE POLICY "can delete only authed" ON "public"."posts" FOR DELETE TO "authenticated" USING (("author" = "auth"."uid"()));

CREATE POLICY "can follow only follower" ON "public"."follows" FOR INSERT TO "authenticated" WITH CHECK ((("follower_id" = "auth"."uid"()) AND ("follower_id" <> "followee_id")));

CREATE POLICY "can like only authed" ON "public"."post_likes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can repost only authed" ON "public"."reposts" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can unfollow only follower" ON "public"."follows" FOR DELETE TO "authenticated" USING (("follower_id" = "auth"."uid"()));

CREATE POLICY "can unlike only authed" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can unrepost only authed" ON "public"."reposts" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can write only authed" ON "public"."general_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((((("message" IS NOT NULL) AND ("message" <> ''::"text") AND ("length"("message") <= 1000)) OR (("message" IS NULL) AND ("rich" IS NOT NULL))) AND ("author" = "auth"."uid"())));

CREATE POLICY "can write only authed" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((("message" <> ''::"text") AND ("length"("message") <= 2000) AND ("author" = "auth"."uid"()) AND (("chain" IS NULL) OR ("token_address" IS NULL) OR (( SELECT "tokens"."owner"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "posts"."chain") AND ("tokens"."token_address" = "posts"."token_address"))) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (( SELECT "tokens"."write_token_required"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "posts"."chain") AND ("tokens"."token_address" = "posts"."token_address"))) <= ( SELECT "token_holders"."last_fetched_balance"
   FROM "public"."token_holders"
  WHERE (("token_holders"."chain" = "posts"."chain") AND ("token_holders"."token_address" = "posts"."token_address") AND ("token_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))))))));

ALTER TABLE "public"."contract_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."general_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."old_pal_token_balances" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."old_pal_tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reposts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."token_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."token_holders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tracked_event_blocks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update pal token's metadata" ON "public"."old_pal_tokens" FOR UPDATE TO "authenticated" USING (("owner" = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"())))) WITH CHECK (("owner" = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))));

ALTER TABLE "public"."user_wallets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users_public" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."activities" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."follows" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."general_chat_messages" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."post_likes" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."reposts" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."token_holders" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."tokens" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."user_wallets" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."users_public" FOR SELECT USING (true);

CREATE POLICY "view everyone or only token holders" ON "public"."posts" FOR SELECT USING ((("target" = 0) OR ("author" = "auth"."uid"()) OR ("chain" IS NULL) OR ("token_address" IS NULL) OR ((( SELECT "tokens"."owner"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "posts"."chain") AND ("tokens"."token_address" = "posts"."token_address"))) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (( SELECT "tokens"."view_token_required"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "posts"."chain") AND ("tokens"."token_address" = "posts"."token_address"))) <= ( SELECT "token_holders"."last_fetched_balance"
   FROM "public"."token_holders"
  WHERE (("token_holders"."chain" = "posts"."chain") AND ("token_holders"."token_address" = "posts"."token_address") AND ("token_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))))))));

CREATE POLICY "view only holder or owner" ON "public"."token_chat_messages" FOR SELECT TO "authenticated" USING (((( SELECT "tokens"."owner"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "token_chat_messages"."chain") AND ("tokens"."token_address" = "token_chat_messages"."token_address"))) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (( SELECT "tokens"."view_token_required"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "token_chat_messages"."chain") AND ("tokens"."token_address" = "token_chat_messages"."token_address"))) <= ( SELECT "token_holders"."last_fetched_balance"
   FROM "public"."token_holders"
  WHERE (("token_holders"."chain" = "token_chat_messages"."chain") AND ("token_holders"."token_address" = "token_chat_messages"."token_address") AND ("token_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"()))))))));

ALTER TABLE "public"."wallet_linking_nonces" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "write only holder or owner" ON "public"."token_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((((("message" <> ''::"text") AND ("length"("message") < 1000)) OR ("rich" IS NOT NULL)) AND ("author" = "auth"."uid"()) AND ((( SELECT "tokens"."owner"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "token_chat_messages"."chain") AND ("tokens"."token_address" = "token_chat_messages"."token_address"))) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (( SELECT "tokens"."write_token_required"
   FROM "public"."tokens"
  WHERE (("tokens"."chain" = "token_chat_messages"."chain") AND ("tokens"."token_address" = "token_chat_messages"."token_address"))) <= ( SELECT "token_holders"."last_fetched_balance"
   FROM "public"."token_holders"
  WHERE (("token_holders"."chain" = "token_chat_messages"."chain") AND ("token_holders"."token_address" = "token_chat_messages"."token_address") AND ("token_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))))))));

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."check_view_granted"("parameter_token_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_view_granted"("parameter_token_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_view_granted"("parameter_token_address" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."check_write_granted"("parameter_token_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_write_granted"("parameter_token_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_write_granted"("parameter_token_address" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_activities"("last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_activities"("last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_activities"("last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_activities_with_users"("last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_held_or_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_held_or_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_held_or_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_new_tokens"("last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_new_tokens"("last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_new_tokens"("last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_owned_tokens"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token"("p_chain" "text", "p_token_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_token"("p_chain" "text", "p_token_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token"("p_chain" "text", "p_token_address" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token_activities"("p_chain" "text", "p_token_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_activities"("p_chain" "text", "p_token_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_activities"("p_chain" "text", "p_token_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token_held_activities_with_users"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_held_activities_with_users"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_held_activities_with_users"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" "text", "p_token_address" "text", "last_balance" numeric, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" "text", "p_token_address" "text", "last_balance" numeric, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_holders"("p_chain" "text", "p_token_address" "text", "last_balance" numeric, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_top_tokens"("last_rank" integer, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_tokens"("last_rank" integer, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_tokens"("last_rank" integer, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_trending_tokens"("p_last_purchased_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trending_tokens"("p_last_purchased_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trending_tokens"("p_last_purchased_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "service_role";

GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "service_role";

GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_token_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_token_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_token_last_message"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "service_role";

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";

GRANT ALL ON TABLE "public"."token_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."token_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."token_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."contract_events" TO "anon";
GRANT ALL ON TABLE "public"."contract_events" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_events" TO "service_role";

GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";

GRANT ALL ON TABLE "public"."general_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."general_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."general_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."general_chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."general_chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."general_chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."old_pal_token_balances" TO "anon";
GRANT ALL ON TABLE "public"."old_pal_token_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."old_pal_token_balances" TO "service_role";

GRANT ALL ON TABLE "public"."old_pal_tokens" TO "anon";
GRANT ALL ON TABLE "public"."old_pal_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."old_pal_tokens" TO "service_role";

GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."reposts" TO "anon";
GRANT ALL ON TABLE "public"."reposts" TO "authenticated";
GRANT ALL ON TABLE "public"."reposts" TO "service_role";

GRANT ALL ON TABLE "public"."token_holders" TO "anon";
GRANT ALL ON TABLE "public"."token_holders" TO "authenticated";
GRANT ALL ON TABLE "public"."token_holders" TO "service_role";

GRANT ALL ON TABLE "public"."tokens" TO "anon";
GRANT ALL ON TABLE "public"."tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."tokens" TO "service_role";

GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "anon";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "service_role";

GRANT ALL ON TABLE "public"."user_wallets" TO "anon";
GRANT ALL ON TABLE "public"."user_wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."user_wallets" TO "service_role";

GRANT ALL ON TABLE "public"."users_public" TO "anon";
GRANT ALL ON TABLE "public"."users_public" TO "authenticated";
GRANT ALL ON TABLE "public"."users_public" TO "service_role";

GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
