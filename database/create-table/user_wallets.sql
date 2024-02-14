CREATE TABLE IF NOT EXISTS "public"."user_wallets" (
    "wallet_address" "text" NOT NULL,
    "total_token_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."user_wallets" OWNER TO "postgres";

ALTER TABLE ONLY "public"."user_wallets"
    ADD CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE "public"."user_wallets" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."user_wallets" TO "anon";
GRANT ALL ON TABLE "public"."user_wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."user_wallets" TO "service_role";

CREATE POLICY "view everyone" ON "public"."user_wallets" FOR SELECT USING (true);
