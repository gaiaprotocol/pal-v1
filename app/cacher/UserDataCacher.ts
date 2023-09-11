import SupabaseManager from "../SupabaseManager.js";
import UserDetails from "../data/UserDetails.js";

class UserDataCacher {
  private userDataMap: Map<string, UserDetails> = new Map<
    string,
    UserDetails
  >();

  public getCachedUserData(walletAddress: string): UserDetails | undefined {
    return this.userDataMap.get(walletAddress);
  }

  public async getMultipleUserData(walletAddresses: string[]) {
    const userDataList: UserDetails[] = [];
    for (const walletAddress of walletAddresses) {
      if (this.userDataMap.has(walletAddress)) {
        const userData = this.userDataMap.get(walletAddress);
        if (userData) {
          userDataList.push(userData);
          walletAddresses.splice(walletAddresses.indexOf(walletAddress), 1);
        }
      }
    }
    if (walletAddresses.length === 0) {
      return userDataList;
    }
    const { data, error } = await SupabaseManager.supabase.from(
      "user_details",
    ).select("*").in("wallet_address", walletAddresses);
    if (error) {
      throw error;
    }
    if (data) {
      for (const userData of data) {
        userDataList.push(userData);
        this.userDataMap.set(
          (userData as UserDetails).wallet_address,
          userData,
        );
      }
    }
    return userDataList;
  }
}

export default new UserDataCacher();
