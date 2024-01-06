CREATE TABLE IF NOT EXISTS "public"."token_holders" (
    "chain" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."token_holders" OWNER TO "postgres";

ALTER TABLE ONLY "public"."token_holders"
    ADD CONSTRAINT "token_holders_pkey" PRIMARY KEY ("chain", "token_address", "wallet_address");

ALTER TABLE "public"."token_holders" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."token_holders" TO "anon";
GRANT ALL ON TABLE "public"."token_holders" TO "authenticated";
GRANT ALL ON TABLE "public"."token_holders" TO "service_role";
