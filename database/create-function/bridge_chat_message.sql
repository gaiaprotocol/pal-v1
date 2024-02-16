CREATE OR REPLACE FUNCTION "public"."bridge_chat_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    IF new.source = 'pal' THEN
        perform net.http_post(
            'https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/bridge-chat-message',
            headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY"}'::JSONB,
            body := ('{"key": "{KEY}", "from": "pal", "messageId": ' || new.id || '}')::JSONB
        ) AS request_id;
    END IF;
    RETURN null;
END;$$;

ALTER FUNCTION "public"."bridge_chat_message"() OWNER TO "postgres";

CREATE TRIGGER "bridge_chat_message" AFTER INSERT ON "public"."general_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."bridge_chat_message"();

GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "service_role";