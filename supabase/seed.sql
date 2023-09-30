
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

CREATE OR REPLACE FUNCTION "public"."update_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update pal_tokens
  set
    last_message = new.author_name || ': ' || new.message,
    last_message_sent_at = now()
  where
    chain = 'base' and
    token_address = new.token_address;
  return null;
end;$$;

ALTER FUNCTION "public"."update_last_message"() OWNER TO "postgres";

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

CREATE TABLE IF NOT EXISTS "public"."blocked_fcm_topics" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "topic" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."blocked_fcm_topics" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."token_chat_messages" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "token_address" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message_type" smallint NOT NULL,
    "message" "text",
    "rich" "jsonb",
    "translated" "jsonb",
    "author_name" "text",
    "author_avatar_url" "text",
    "chain" "text" DEFAULT 'base'::"text" NOT NULL
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

CREATE TABLE IF NOT EXISTS "public"."favorite_tokens" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "token_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chain" "text" DEFAULT 'base'::"text" NOT NULL
);

ALTER TABLE "public"."favorite_tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."fcm_subscribed_topics" (
    "token" "text" NOT NULL,
    "topic" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."fcm_subscribed_topics" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."nonce" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wallet_address" "text" NOT NULL
);

ALTER TABLE "public"."nonce" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."pal_contract_events" (
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "event_type" smallint NOT NULL,
    "args" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "chain" "text" DEFAULT 'base'::"text" NOT NULL
);

ALTER TABLE "public"."pal_contract_events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."pal_token_balances" (
    "token_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "chain" "text" DEFAULT 'base'::"text" NOT NULL
);

ALTER TABLE "public"."pal_token_balances" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."pal_tokens" (
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

ALTER TABLE "public"."pal_tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."regular_chat_messages" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "topic" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message_type" smallint NOT NULL,
    "message" "text",
    "rich" "jsonb",
    "translated" "jsonb",
    "author_name" "text",
    "author_avatar_url" "text"
);

ALTER TABLE "public"."regular_chat_messages" OWNER TO "postgres";

ALTER TABLE "public"."regular_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."regular_chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."tracked_event_blocks" (
    "block_number" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "chain" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "public"."tracked_event_blocks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_details" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wallet_address" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "profile_image" "text",
    "display_name" "text",
    "trading_fees_earned" numeric DEFAULT '0'::numeric NOT NULL
);

ALTER TABLE "public"."user_details" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_fcm_tokens" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "token" "text" NOT NULL
);

ALTER TABLE "public"."user_fcm_tokens" OWNER TO "postgres";

ALTER TABLE ONLY "public"."blocked_fcm_topics"
    ADD CONSTRAINT "blocked_fcm_topics_pkey" PRIMARY KEY ("user_id", "topic");

ALTER TABLE ONLY "public"."token_chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorite_tokens"
    ADD CONSTRAINT "favorite_tokens_pkey" PRIMARY KEY ("user_id", "token_address", "chain");

ALTER TABLE ONLY "public"."fcm_subscribed_topics"
    ADD CONSTRAINT "fcm_subscribed_topics_pkey" PRIMARY KEY ("token", "topic");

ALTER TABLE ONLY "public"."nonce"
    ADD CONSTRAINT "nonce_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."pal_contract_events"
    ADD CONSTRAINT "pal_contract_events_pkey" PRIMARY KEY ("block_number", "log_index", "chain");

ALTER TABLE ONLY "public"."pal_token_balances"
    ADD CONSTRAINT "pal_token_balances_pkey" PRIMARY KEY ("token_address", "wallet_address", "chain");

ALTER TABLE ONLY "public"."pal_tokens"
    ADD CONSTRAINT "pal_tokens_pkey" PRIMARY KEY ("token_address", "chain");

ALTER TABLE ONLY "public"."regular_chat_messages"
    ADD CONSTRAINT "regular_chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tracked_event_blocks"
    ADD CONSTRAINT "tracked_event_blocks_pkey" PRIMARY KEY ("chain");

ALTER TABLE ONLY "public"."user_fcm_tokens"
    ADD CONSTRAINT "user_fcm_tokens_pkey" PRIMARY KEY ("user_id", "token");

ALTER TABLE ONLY "public"."user_details"
    ADD CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_details"
    ADD CONSTRAINT "user_wallets_wallet_address_key" UNIQUE ("wallet_address");

CREATE TRIGGER "decrement_token_favorite_count" AFTER DELETE ON "public"."favorite_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_token_favorite_count"();

CREATE TRIGGER "increment_token_favorite_count" AFTER INSERT ON "public"."favorite_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."increment_token_favorite_count"();

CREATE TRIGGER "increment_trading_fees_earned" AFTER INSERT ON "public"."pal_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."increment_trading_fees_earned"();

CREATE TRIGGER "new_pal_token" AFTER INSERT ON "public"."pal_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."new_pal_token"();

CREATE TRIGGER "update_last_message" AFTER INSERT ON "public"."token_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_last_message"();

CREATE TRIGGER "update_price_trend" BEFORE UPDATE ON "public"."pal_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_price_trend"();

ALTER TABLE ONLY "public"."blocked_fcm_topics"
    ADD CONSTRAINT "blocked_fcm_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."favorite_tokens"
    ADD CONSTRAINT "favorite_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."regular_chat_messages"
    ADD CONSTRAINT "regular_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."token_chat_messages"
    ADD CONSTRAINT "token_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."user_details"
    ADD CONSTRAINT "user_details_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."user_fcm_tokens"
    ADD CONSTRAINT "user_fcm_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

CREATE POLICY "allow anon access" ON "public"."regular_chat_messages" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."pal_contract_events" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."pal_token_balances" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."pal_tokens" FOR SELECT USING (true);

CREATE POLICY "allow anon select" ON "public"."user_details" FOR SELECT USING (true);

ALTER TABLE "public"."blocked_fcm_topics" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."favorite_tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."fcm_subscribed_topics" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."nonce" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "only user" ON "public"."favorite_tokens" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "only user" ON "public"."user_fcm_tokens" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."pal_contract_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pal_token_balances" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pal_tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."regular_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."token_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tracked_event_blocks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update pal token's metadata" ON "public"."pal_tokens" FOR UPDATE TO "authenticated" USING (("owner" = ( SELECT "user_details"."wallet_address"
   FROM "public"."user_details"
  WHERE ("user_details"."id" = "auth"."uid"())))) WITH CHECK (("owner" = ( SELECT "user_details"."wallet_address"
   FROM "public"."user_details"
  WHERE ("user_details"."id" = "auth"."uid"()))));

ALTER TABLE "public"."user_details" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_fcm_tokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view only holder or owner" ON "public"."token_chat_messages" FOR SELECT TO "authenticated" USING (((( SELECT "pal_tokens"."owner"
   FROM "public"."pal_tokens"
  WHERE ("pal_tokens"."token_address" = "token_chat_messages"."token_address")) = ( SELECT "user_details"."wallet_address"
   FROM "public"."user_details"
  WHERE ("user_details"."id" = "auth"."uid"()))) OR (( SELECT "pal_tokens"."view_token_required"
   FROM "public"."pal_tokens"
  WHERE ("pal_tokens"."token_address" = "token_chat_messages"."token_address")) <= ( SELECT "pal_token_balances"."last_fetched_balance"
   FROM "public"."pal_token_balances"
  WHERE (("pal_token_balances"."token_address" = "token_chat_messages"."token_address") AND ("pal_token_balances"."wallet_address" = ( SELECT "user_details"."wallet_address"
           FROM "public"."user_details"
          WHERE ("user_details"."id" = "auth"."uid"()))))))));

CREATE POLICY "write only holder or owner" ON "public"."token_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "author") AND ((( SELECT "pal_tokens"."owner"
   FROM "public"."pal_tokens"
  WHERE ("pal_tokens"."token_address" = "token_chat_messages"."token_address")) = ( SELECT "user_details"."wallet_address"
   FROM "public"."user_details"
  WHERE ("user_details"."id" = "auth"."uid"()))) OR (( SELECT "pal_tokens"."write_token_required"
   FROM "public"."pal_tokens"
  WHERE ("pal_tokens"."token_address" = "token_chat_messages"."token_address")) <= ( SELECT "pal_token_balances"."last_fetched_balance"
   FROM "public"."pal_token_balances"
  WHERE (("pal_token_balances"."token_address" = "token_chat_messages"."token_address") AND ("pal_token_balances"."wallet_address" = ( SELECT "user_details"."wallet_address"
           FROM "public"."user_details"
          WHERE ("user_details"."id" = "auth"."uid"())))))))));

CREATE POLICY "writer only authed" ON "public"."regular_chat_messages" FOR INSERT TO "authenticated" WITH CHECK (("author" = "auth"."uid"()));

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

GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_token_favorite_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_token_favorite_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_trading_fees_earned"() TO "service_role";

GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."new_pal_token"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_last_message"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_price_trend"() TO "service_role";

GRANT ALL ON TABLE "public"."blocked_fcm_topics" TO "anon";
GRANT ALL ON TABLE "public"."blocked_fcm_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_fcm_topics" TO "service_role";

GRANT ALL ON TABLE "public"."token_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."token_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."token_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."favorite_tokens" TO "anon";
GRANT ALL ON TABLE "public"."favorite_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."favorite_tokens" TO "service_role";

GRANT ALL ON TABLE "public"."fcm_subscribed_topics" TO "anon";
GRANT ALL ON TABLE "public"."fcm_subscribed_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."fcm_subscribed_topics" TO "service_role";

GRANT ALL ON TABLE "public"."nonce" TO "anon";
GRANT ALL ON TABLE "public"."nonce" TO "authenticated";
GRANT ALL ON TABLE "public"."nonce" TO "service_role";

GRANT ALL ON TABLE "public"."pal_contract_events" TO "anon";
GRANT ALL ON TABLE "public"."pal_contract_events" TO "authenticated";
GRANT ALL ON TABLE "public"."pal_contract_events" TO "service_role";

GRANT ALL ON TABLE "public"."pal_token_balances" TO "anon";
GRANT ALL ON TABLE "public"."pal_token_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."pal_token_balances" TO "service_role";

GRANT ALL ON TABLE "public"."pal_tokens" TO "anon";
GRANT ALL ON TABLE "public"."pal_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."pal_tokens" TO "service_role";

GRANT ALL ON TABLE "public"."regular_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."regular_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."regular_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."regular_chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."regular_chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."regular_chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "anon";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "service_role";

GRANT ALL ON TABLE "public"."user_details" TO "anon";
GRANT ALL ON TABLE "public"."user_details" TO "authenticated";
GRANT ALL ON TABLE "public"."user_details" TO "service_role";

GRANT ALL ON TABLE "public"."user_fcm_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_fcm_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_fcm_tokens" TO "service_role";

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
