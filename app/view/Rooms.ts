import { DomNode, el, View } from "common-dapp-module";
import RoomList from "../component/rooms/RoomList.js";
import TokenHoldingsAggregatorContract from "../contract/TokenHoldingsAggregatorContract.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";

export default class Rooms extends View {
  private container: DomNode;

  private myRooms: RoomList;
  private holdingRooms: RoomList;
  //private friendsRooms: RoomList;
  private topRooms: RoomList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".rooms-view",
        el(
          ".rooms",
          this.myRooms = new RoomList("My Rooms"),
          this.holdingRooms = new RoomList("Holding Token's Rooms"),
          //this.friendsRooms = new RoomList("Friends Rooms"),
          this.topRooms = new RoomList("Top Rooms"),
        ),
      ),
    );

    this.loadRooms();
  }

  private loadRooms() {
    this.loadMyTokenRooms();
    this.loadHoldingTokenRooms();
    this.loadFriendsTokenRooms();
    this.loadTopRooms();
  }

  private async loadMyTokenRooms(): Promise<void> {
    const { data } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      )
      .eq("owner", UserManager.userWalletAddress);
    if (data) {
      this.myRooms.rooms = data as any;
    }
  }

  private async loadHoldingTokenRooms(): Promise<void> {
    if (UserManager.userWalletAddress) {
      const { data } = await SupabaseManager.supabase.from("pal_tokens")
        .select(
          "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
        );
      if (data) {
        const tokenAddresses: string[] = (data as any)?.map((token: any) =>
          token.token_address
        ) ??
          [];
        const balances = await TokenHoldingsAggregatorContract.getERC20Balances(
          UserManager.userWalletAddress,
          tokenAddresses,
        );
        for (const [index, balance] of balances.entries()) {
          const d = data[index] as any;
          if (balance >= BigInt(d.view_token_required)) {
            this.holdingRooms.add(d);
          }
        }
      }
    }
  }

  private async loadFriendsTokenRooms(): Promise<void> {
    //TODO: Implement after profit is generated
    /*const { data, error } = await SupabaseManager.supabase.functions.invoke(
      "get-friends",
    );
    console.log(data, error);*/
  }

  private async loadTopRooms(): Promise<void> {
    const { data } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        "*, view_token_required::text, write_token_required::text, last_fetched_price::text",
      )
      .order("last_fetched_price", { ascending: false })
      .limit(50);
    if (data) {
      this.topRooms.rooms = data as any;
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
