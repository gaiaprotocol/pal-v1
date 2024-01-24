CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."post_likes" OWNER TO "postgres";

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

CREATE POLICY "can like only authed" ON "public"."post_likes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can unlike only authed" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."post_likes" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";
