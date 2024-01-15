CREATE OR REPLACE FUNCTION "public"."parse_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_receiver UUID;
    v_triggerer UUID;
BEGIN
    IF new.event_name = 'UserTokenCreated' THEN
        
        -- add activity
        insert into activities (
            chain, block_number, log_index, tx, wallet_address, token_address, activity_name, args
        ) values (
            new.chain, new.block_number, new.log_index, new.tx, new.args[1], new.args[2], new.event_name, new.args
        );
        
        -- add token info
        insert into tokens (
            chain, token_address, owner, name, symbol
        ) values (
            new.chain, new.args[2], new.args[1], new.args[3], new.args[4]
        );
        
        -- notify
        v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = new.args[1]);
        IF v_receiver IS NOT NULL THEN
            insert into notifications (
                user_id, type, chain, token_address
            ) values (
                v_receiver, 0, new.chain, new.args[2]
            );
        END IF;

    ELSIF new.event_name = 'Trade' THEN

        -- add activity
        insert into activities (
            chain, block_number, log_index, tx, wallet_address, token_address, activity_name, args
        ) values (
            new.chain, new.block_number, new.log_index, new.tx, new.args[1], new.args[2], new.event_name, new.args
        );

        -- notify
        v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = (
            SELECT owner FROM tokens WHERE chain = new.chain AND token_address = new.args[2]
        ));
        v_triggerer := (SELECT user_id FROM users_public WHERE wallet_address = new.args[1]);
        IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
            insert into notifications (
                user_id, triggerer, type, chain, token_address, amount
            ) values (
                v_receiver, v_triggerer, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END, new.chain, new.args[2], new.args[4]::numeric
            );
        END IF;

        -- buy
        IF new.args[3] = 'true' THEN
            
            -- update token info
            update tokens set
                supply = CASE WHEN new.chain = 'base' AND new.block_number < 8865668 THEN new.args[8]::numeric ELSE new.args[9]::numeric END,
                last_fetched_key_price = new.args[5]::numeric,
                total_trading_key_volume = total_trading_key_volume + new.args[5]::numeric,
                is_price_up = true,
                last_key_purchased_at = now()
            where chain = new.chain and token_address = new.args[2];

            -- update token holder info
            insert into token_holders (
                chain, token_address, wallet_address, last_fetched_balance
            ) values (
                new.chain, new.args[2], new.args[1], new.args[4]::numeric
            ) on conflict (chain, token_address, wallet_address) do update
                set last_fetched_balance = token_holders.last_fetched_balance + new.args[4]::numeric;
            
            -- if token holder is new, add to token holder count
            IF NOT FOUND THEN
                update tokens set
                    holders = holders + 1
                where chain = new.chain and token_address = new.args[2];
            END IF;
            
            -- update wallet's total key balance
            insert into wallets (
                wallet_address, total_key_balance
            ) values (
                new.args[1], new.args[4]::numeric
            ) on conflict (wallet_address) do update
                set total_key_balance = wallets.total_key_balance + new.args[4]::numeric;

        -- sell
        ELSE
            -- update token info
            update tokens set
                supply = CASE WHEN new.chain = 'base' AND new.block_number < 8865668 THEN new.args[8]::numeric ELSE new.args[9]::numeric END,
                last_fetched_key_price = new.args[5]::numeric,
                total_trading_key_volume = total_trading_key_volume + new.args[5]::numeric,
                is_price_up = false
            where chain = new.chain and token_address = new.args[2];

            -- update token holder info
            WITH updated AS (
                UPDATE token_holders
                SET last_fetched_balance = last_fetched_balance - new.args[4]::numeric
                WHERE chain = new.chain
                AND token_address = new.args[2]
                AND wallet_address = new.args[1]
                RETURNING wallet_address, last_fetched_balance
            )
            DELETE FROM token_holders
            WHERE (wallet_address, last_fetched_balance) IN (
                SELECT wallet_address, last_fetched_balance FROM updated WHERE last_fetched_balance = 0
            );

            -- if token holder is gone, subtract from token holder count
            IF FOUND THEN
                update tokens set
                    holders = holders - 1
                where chain = new.chain and token_address = new.args[2];
            END IF;
            
            -- update wallet's total key balance
            update wallets set
                total_key_balance = total_key_balance - new.args[4]::numeric
            where wallet_address = new.args[1];
        END IF;
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_contract_event"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_contract_event"() TO "service_role";
