CREATE TABLE IF NOT EXISTS "public"."activities" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "wallet_address" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "activity_name" "text" NOT NULL,
    "args" "text" DEFAULT '[]'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."activities" OWNER TO "postgres";

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("chain", "block_number", "log_index");

ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";
