import { ethers } from "https://esm.sh/ethers@6.7.0";
import { rpcs } from "../_shared/blockchain.ts";
import PalContract from "../_shared/contracts/PalContract.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

serveWithOptions(async (req) => {
  const { chain, blockPeriod = 750 } = await req.json();
  if (!chain) throw new Error("Missing chain");

  const provider = new ethers.JsonRpcProvider(rpcs[chain]);
  const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
  const contract = new PalContract(chain, signer);

  const { data, error: fetchEventBlockError } = await supabase.from(
    "tracked_event_blocks",
  ).select().eq("chain", chain);
  if (fetchEventBlockError) throw fetchEventBlockError;

  let toBlock = (data?.[0]?.block_number ?? contract.deployBlockNumber) +
    blockPeriod;

  const currentBlock = await provider.getBlockNumber();
  if (toBlock > currentBlock) toBlock = currentBlock;

  const events = await contract.getEvents(toBlock - blockPeriod * 2, toBlock);
  for (const event of events) {
    const eventName = Object.keys(contract.eventTopicFilters).find((key) =>
      contract.eventTopicFilters[key][0] === event.topics[0]
    );

    const args = event.args.map((arg) => arg.toString());
    const data: any = {
      chain,
      block_number: event.blockNumber,
      log_index: event.index,
      tx: event.transactionHash,
      event_name: eventName,
      args,
    };

    if (eventName === "UserTokenCreated" || eventName === "Trade") {
      data.wallet_address = args[0];
      data.token_address = args[1];
    }

    const { error: saveEventError } = await supabase
      .from("contract_events")
      .upsert(data);
    if (saveEventError) throw saveEventError;
  }

  const { error: saveEventBlockError } = await supabase.from(
    "tracked_event_blocks",
  ).upsert({
    chain,
    block_number: toBlock,
    updated_at: new Date().toISOString(),
  });
  if (saveEventBlockError) throw saveEventBlockError;
});
