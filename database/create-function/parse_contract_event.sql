CREATE OR REPLACE FUNCTION "public"."parse_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF new.event_name = 'UserTokenCreated' THEN
        -- add token info
        insert into tokens (
            chain, token_address, owner, name, symbol
        ) values (
            new.chain, new.args[2], new.args[1], new.args[3], new.args[4]
        );
    ELSIF new.event_name = 'Trade' THEN
        -- update token info
        -- update token holder info
        -- update wallet's total key balance
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_contract_event"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "service_role";
