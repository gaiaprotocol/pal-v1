CREATE TABLE IF NOT EXISTS "public"."users_public" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text",
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "display_name" "text",
    "avatar" "text",
    "avatar_thumb" "text",
    "avatar_stored" boolean DEFAULT false NOT NULL,
    "stored_avatar" "text",
    "stored_avatar_thumb" "text",
    "x_username" "text",
    "metadata" "jsonb",
    "follower_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "blocked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."users_public" OWNER TO "postgres";
ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_pkey" PRIMARY KEY ("user_id");
ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");
ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_wallet_address_key" UNIQUE ("wallet_address");

ALTER TABLE "public"."users_public" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."users_public" TO "anon";
GRANT ALL ON TABLE "public"."users_public" TO "authenticated";
GRANT ALL ON TABLE "public"."users_public" TO "service_role";

CREATE POLICY "view everyone" ON "public"."users_public" FOR SELECT USING (true);
