CREATE TABLE IF NOT EXISTS "public"."reposts" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reposts" OWNER TO "postgres";

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

CREATE POLICY "can repost only authed" ON "public"."reposts" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can unrepost only authed" ON "public"."reposts" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."reposts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."reposts" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."reposts" TO "anon";
GRANT ALL ON TABLE "public"."reposts" TO "authenticated";
GRANT ALL ON TABLE "public"."reposts" TO "service_role";
