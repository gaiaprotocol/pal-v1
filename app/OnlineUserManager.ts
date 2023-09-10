import { RealtimeChannel } from "@supabase/supabase-js";
import { EventContainer } from "common-dapp-module";
import SupabaseManager from "./SupabaseManager.js";
import UserManager from "./user/UserManager.js";

class OnlineUserManager extends EventContainer {
  private _channel: RealtimeChannel | undefined;
  public onlineUsers: {
    userId: string;
    userName: string;
    profileImage: string;
    walletAddress: string;
    onlineAt: string;
  }[] = [];

  public init() {
    this.createChannel();
  }

  private createChannel() {
    if (this._channel !== undefined) {
      SupabaseManager.supabase.removeChannel(this._channel);
    }
    const channel = SupabaseManager.supabase.channel("online_users");
    channel.on(
      "presence",
      { event: "sync" },
      () => {
        const newState: any = channel.presenceState();
        this.onlineUsers = [];
        for (const state of Object.values<any>(newState)) {
          for (const data of state) {
            if (!this.onlineUsers.find((u) => u.userId === data.userId)) {
              this.onlineUsers.push(data);
            }
          }
        }
        this.fireEvent("onlineUsersChanged");
      },
    );
    channel.subscribe(async (status, error) => {
      console.log(status, error);
      if (status === "SUBSCRIBED") {
        await this.track();
      }
    });
    this._channel = channel;
  }

  public async track() {
    if (this._channel !== undefined && UserManager.user) {
      await this._channel.track({
        userId: UserManager.user.id,
        userName: UserManager.user.user_metadata.full_name,
        profileImage: UserManager.user.user_metadata.avatar_url,
        walletAddress: UserManager.userWalletAddress,
        onlineAt: new Date().toISOString(),
      });
    }
  }
}

export default new OnlineUserManager();
