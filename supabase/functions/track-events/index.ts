import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import PalContract from "../_shared/contracts/PalContract.ts";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("BASE_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const palContract = new PalContract(signer);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async () => {
  const { data, error } = await supabase
    .from("tracked_event_blocks")
    .select()
    .eq("id", 0);

  if (error) {
    return responseError(error);
  }

  let toTrackBlock = (data?.[0]?.block_number ??
    parseInt(Deno.env.get("PAL_DEPLOY_BLOCK")!)) + 1000;

  const currentBlock = await provider.getBlockNumber();
  if (toTrackBlock > currentBlock) {
    toTrackBlock = currentBlock;
  }

  const events = await palContract.getEvents(
    toTrackBlock - 2000,
    toTrackBlock,
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
      const { error } = await supabase
        .from("pal_contract_events")
        .upsert({
          block_number: event.blockNumber,
          log_index: event.index,
          event_type,
          args: event.args.map((arg) => arg.toString()),
          wallet_address: event.args[0],
          token_address: event.args[1],
        });

      if (error) {
        return responseError(error);
      }
    }
  }

  const { error: error2 } = await supabase
    .from("tracked_event_blocks")
    .upsert({
      id: 0,
      block_number: toTrackBlock,
      updated_at: new Date().toISOString(),
    });

  if (error2) {
    return responseError(error2);
  }

  return response({});
});
