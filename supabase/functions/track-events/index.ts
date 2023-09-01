import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalContract from "../_shared/contracts/PalContract.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const palContract = new PalContract(signer);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  const events = await palContract.getEvents(
    parseInt(Deno.env.get("PAL_DEPLOY_BLOCK")!),
    parseInt(Deno.env.get("PAL_DEPLOY_BLOCK")!) + 2000,
  );
  for (const event of events) {
    const eventTopic = event.topics[0];

    let event_type;
    if (eventTopic === palContract.tokenCreatedEventFilter?.[0]) {
      event_type = 0;
    } else if (eventTopic === palContract.tradeEventFilter?.[0]) {
      event_type = 1;
    }

    if (event_type !== undefined) {
      await supabase
        .from("pal_contract_events")
        .upsert({
          block_number: event.blockNumber,
          log_index: event.index,
          event_type,
          args: event.args,
        });
    }
  }
  return new Response(
    JSON.stringify(events),
    { headers: { "Content-Type": "application/json" } },
  );
});
