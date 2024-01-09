import { Supabase } from "@common-module/app";
import BlockchainType from "./blockchain/BlockchainType.js";

class TrackEventManager {
  public async trackEvent(chain: BlockchainType) {
    Supabase.client.functions.invoke("track-contract-events", {
      body: { chain },
    });
  }
}

export default new TrackEventManager();
