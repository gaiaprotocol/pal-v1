import { ethers } from "https://esm.sh/ethers@6.7.0";
import { rpcs } from "../_shared/blockchain.ts";
import SIRC20Contract from "../_shared/contracts/SIRC20Contract.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

serveWithOptions(async (req) => {
  const { chain, blockPeriod = 750 } = await req.json();
  if (!chain) throw new Error("Missing chain or contract type");

  const provider = new ethers.JsonRpcProvider(rpcs[chain]);
  const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
  const contract = new SIRC20Contract(chain, signer);

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
    if (
      eventName === "Deploy" || eventName === "Mint" || eventName === "Transfer"
    ) {
      args[0] = ethers.decodeBytes32String(args[0]);
    } else if (
      eventName === "List" || eventName === "Delist" || eventName === "Buy"
    ) {
      args[1] = ethers.decodeBytes32String(args[1]);
    }
    const data = {
      chain,
      block_number: event.blockNumber,
      log_index: event.index,
      tx: event.transactionHash,
      event_name: eventName,
      args,
    };
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
