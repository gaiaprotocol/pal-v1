CREATE OR REPLACE FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    portfolio_value numeric := 0;
    v_holder record;
    v_token record;
BEGIN
    FOR v_holder IN (
        SELECT 
            chain,
            token_address,
            last_fetched_balance
        FROM 
            token_holders 
        WHERE 
            wallet_address = p_wallet_address
    ) LOOP
        FOR v_token IN (
            SELECT 
                last_fetched_key_price 
            FROM 
                tokens
            WHERE 
                chain = v_holder.chain AND token_address = v_holder.token_address
        ) LOOP
            portfolio_value := portfolio_value + (v_holder.last_fetched_balance::numeric * v_token.last_fetched_key_price);
        END LOOP;
    END LOOP;
    RETURN portfolio_value::text;
END;
$$;

ALTER FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "service_role";
