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
        chain: activity.token_chain,
        token_address: activity.token_address,
        name: activity.token_name,
        symbol: activity.token_symbol,
        image: activity.token_image,
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
}

export default new ActivityService();
