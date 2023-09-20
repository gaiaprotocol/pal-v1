import { EventContainer } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";
import UserDetails from "../data/UserDetails.js";

class UserDetailsCacher extends EventContainer {
  private userDataMap: Map<string, UserDetails> = new Map<
    string,
    UserDetails
  >();

  public init() {
    SupabaseManager.supabase
      .channel("user-details-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_details",
        },
        (payload: any) => {
          if (
            payload.eventType === "INSERT" || payload.eventType === "UPDATE"
          ) {
            this.set(payload.new as UserDetails);
          }
        },
      )
      .subscribe();
  }

  public set(userDetails: UserDetails) {
    this.userDataMap.set(userDetails.wallet_address, userDetails);
    this.fireEvent("userDetailsChanged", userDetails);
  }

  public getCached(walletAddress: string): UserDetails | undefined {
    return this.userDataMap.get(walletAddress);
  }

  public async get(walletAddress: string): Promise<UserDetails | undefined> {
    if (this.userDataMap.get(walletAddress)) {
      return this.userDataMap.get(walletAddress);
    }
    const { data, error } = await SupabaseManager.supabase.from("user_details")
      .select().eq("wallet_address", walletAddress);
    if (error) {
      console.error(error);
      return;
    }
    const userDetails = data?.[0];
    if (!userDetails) {
      return;
    }
    this.set(userDetails);
    return userDetails;
  }

  public async load(walletAddresses: string[]) {
    const userDataArray: UserDetails[] = [];
    for (const walletAddress of walletAddresses) {
      if (this.userDataMap.has(walletAddress)) {
        const userData = this.userDataMap.get(walletAddress);
        if (userData) {
          userDataArray.push(userData);
          walletAddresses.splice(walletAddresses.indexOf(walletAddress), 1);
        }
      }
    }
    if (walletAddresses.length === 0) {
      return userDataArray;
    }
    const { data, error } = await SupabaseManager.supabase.from(
      "user_details",
    ).select("*").in("wallet_address", walletAddresses);
    if (error) {
      throw error;
    }
    if (data) {
      for (const userData of data) {
        userDataArray.push(userData);
        this.set(userData);
      }
    }
    return userDataArray;
  }
}

export default new UserDetailsCacher();
