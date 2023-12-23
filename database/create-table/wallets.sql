CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "wallet_address" "text" NOT NULL,
    "total_key_balance" bigint DEFAULT '0'::bigint NOT NULL,
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."wallets" OWNER TO "postgres";

ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."wallets" TO "anon";
GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";

CREATE POLICY "view everyone" ON "public"."wallets" FOR SELECT USING (true);
