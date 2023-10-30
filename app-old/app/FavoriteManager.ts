import { EventContainer } from "common-app-module";
import SupabaseManager from "./SupabaseManager.js";
import UserManager from "./user/UserManager.js";

class FavoriteManager extends EventContainer {
  public favoriteTokenAddresses: string[] = [];

  public async loadSignedUserFavoriteTokens() {
    this.clear();
    if (UserManager.user) {
      const { data, error } = await SupabaseManager.supabase.from(
        "favorite_tokens",
      ).select().eq(
        "user_id",
        UserManager.user.id,
      );
      if (error) {
        console.error(error);
      }
      if (data) {
        for (const favoriteToken of data) {
          this.favoriteTokenAddresses.push(favoriteToken.token_address);
          this.fireEvent("add", favoriteToken.token_address);
        }
      }
    }
  }

  public async add(tokenAddress: string) {
    this.favoriteTokenAddresses.push(tokenAddress);
    this.fireEvent("add", tokenAddress);

    await SupabaseManager.supabase.from("favorite_tokens").insert({
      token_address: tokenAddress,
    });
  }

  public async remove(tokenAddress: string) {
    this.favoriteTokenAddresses = this.favoriteTokenAddresses.filter((r) =>
      r !== tokenAddress
    );
    this.fireEvent("remove", tokenAddress);

    if (UserManager.user) {
      await SupabaseManager.supabase.from("favorite_tokens").delete()
        .eq("token_address", tokenAddress)
        .eq("user_id", UserManager.user.id);
    }
  }

  public clear(): void {
    for (const tokenAddress of this.favoriteTokenAddresses) {
      this.fireEvent("remove", tokenAddress);
    }
    this.favoriteTokenAddresses = [];
  }

  public check(tokenAddress: string): boolean {
    return this.favoriteTokenAddresses.some((r) => r === tokenAddress);
  }
}

export default new FavoriteManager();
