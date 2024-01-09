CREATE TABLE IF NOT EXISTS "public"."contract_events" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "tx" "text" NOT NULL,
    "event_name" "text" NOT NULL,
    "args" "text" [],
    "wallet_address" "text",
    "token_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."contract_events" OWNER TO "postgres";

ALTER TABLE ONLY "public"."contract_events"
    ADD CONSTRAINT "contract_events_pkey" PRIMARY KEY ("chain", "block_number", "log_index");

ALTER TABLE "public"."contract_events" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."contract_events" TO "anon";
GRANT ALL ON TABLE "public"."contract_events" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_events" TO "service_role";
