import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EventContainer } from "common-dapp-module";
import Config from "./Config.js";

class SupabaseManager extends EventContainer {
  public supabase!: SupabaseClient;

  public connect() {
    this.supabase = createClient(Config.supabaseURL, Config.supabaseAnonKey);
  }
}

export default new SupabaseManager();
