CREATE OR REPLACE FUNCTION "public"."bridge_chat_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    perform net.http_post(
        'http://172.17.0.1:54321/functions/v1/bridge-chat-message',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"}'::JSONB,
        body := ('{"key": "test", "from": "app", "messageId": ' || new.id || '}')::JSONB
    ) AS request_id;
    RETURN null;
END;$$;

ALTER FUNCTION "public"."bridge_chat_message"() OWNER TO "postgres";

CREATE TRIGGER "bridge_chat_message" AFTER INSERT ON "public"."general_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."bridge_chat_message"();

GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "service_role";