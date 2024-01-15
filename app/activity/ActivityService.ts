import { Supabase, SupabaseService } from "@common-module/app";
import Activity from "../database-interface/Activity.js";

class ActivityService extends SupabaseService<Activity> {
  constructor() {
    super("activities", "*", 100);
  }

  protected enhanceEventData(events: Activity[]): Activity[] {
    const _activities = Supabase.safeResult<Activity[]>(events);
    for (const activity of _activities as any) {
      activity.token = {
        chain: activity.chain,
        token_address: activity.token_address,
        name: activity.token_name,
        symbol: activity.token_symbol,
        image: activity.token_image,
        image_thumb: activity.token_image_thumb,
        image_stored: activity.token_image_stored,
        stored_image: activity.token_stored_image,
        stored_image_thumb: activity.token_stored_image_thumb,
      };
      activity.user = !activity.user_id ? undefined : {
        user_id: activity.user_id,
        display_name: activity.user_display_name,
        avatar: activity.user_avatar,
        avatar_thumb: activity.user_avatar_thumb,
        stored_avatar: activity.user_stored_avatar,
        stored_avatar_thumb: activity.user_stored_avatar_thumb,
        x_username: activity.user_x_username,
      };
    }
    return _activities;
  }

  public async fetchGlobalActivities(lastCreatedAt?: string) {
    let { data, error } = await Supabase.client.rpc(
      "get_global_activities_with_users",
      {
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    if (!data) data = [];
    return this.enhanceEventData(data);
  }

  public async fetchTokenHeldActivities(
    walletAddress: string,
    lastCreatedAt?: string,
  ) {
    let { data, error } = await Supabase.client.rpc(
      "get_token_held_activities_with_users",
      {
        p_wallet_address: walletAddress,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    if (!data) data = [];
    return this.enhanceEventData(data);
  }
}

export default new ActivityService();
