import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EventContainer } from "@common-module/app";
import Config from "./Config.js";
import UserManager from "./user/UserManager.js";

class SupabaseManager extends EventContainer {
  public supabase!: SupabaseClient;

  public async connect() {
    this.supabase = createClient(Config.supabaseURL, Config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
    await UserManager.loadUser();
  }
}

export default new SupabaseManager();
