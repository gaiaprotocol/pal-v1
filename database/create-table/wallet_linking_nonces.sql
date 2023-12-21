CREATE TABLE IF NOT EXISTS "public"."wallet_linking_nonces" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."wallet_linking_nonces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE "public"."wallet_linking_nonces" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "service_role";
