CREATE TABLE IF NOT EXISTS "public"."tracked_event_blocks" (
    "chain" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."tracked_event_blocks" OWNER TO "postgres";

ALTER TABLE ONLY "public"."tracked_event_blocks"
    ADD CONSTRAINT "tracked_event_blocks_pkey" PRIMARY KEY ("chain");

ALTER TABLE "public"."tracked_event_blocks" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "anon";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "service_role";
