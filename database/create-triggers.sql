
CREATE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "parse_contract_event" AFTER INSERT ON "public"."contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."parse_contract_event"();
CREATE TRIGGER "set_token_last_message" AFTER INSERT ON "public"."token_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_token_last_message"();

-- for post
CREATE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();
CREATE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();
CREATE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();
CREATE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();
CREATE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();
CREATE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();
CREATE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
