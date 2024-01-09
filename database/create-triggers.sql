
CREATE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "parse_contract_event" AFTER INSERT ON "public"."contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."parse_contract_event"();
