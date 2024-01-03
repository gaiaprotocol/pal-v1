import { RealtimeChannel } from "@supabase/supabase-js";
import { EventContainer } from "@common-module/app";
import SupabaseManager from "./SupabaseManager.js";
import UserManager from "./user/UserManager.js";

interface OnlineUser {
  userId: string;
  userName: string;
  profileImage: string;
  walletAddress: string;
  onlineAt: string;
}

class OnlineUserManager extends EventContainer {
  private _channel: RealtimeChannel | undefined;

  public onlineUsers: Map<string, OnlineUser> = new Map<string, OnlineUser>();

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
        this.onlineUsers = new Map<string, OnlineUser>();
        for (const state of Object.values<any>(newState)) {
          for (const data of state) {
            if (!this.onlineUsers.has(data.walletAddress)) {
              this.onlineUsers.set(data.walletAddress, data);
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

  public checkOnline(walletAddress: string): boolean {
    return this.onlineUsers.has(walletAddress);
  }
}

export default new OnlineUserManager();
