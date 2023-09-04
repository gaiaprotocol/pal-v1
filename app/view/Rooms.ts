import { DomNode, el, View } from "common-dapp-module";
import TokenHoldingsAggregatorContract from "../contract/TokenHoldingsAggregatorContract.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";
import RoomList from "../component/rooms/RoomList.js";

export default class Rooms extends View {
  private container: DomNode;

  private myRooms: DomNode;
  private holdingRooms: DomNode;
  private friendsRooms: DomNode;
  private topRooms: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".rooms-view",
        this.myRooms = new RoomList("My Rooms"),
        this.holdingRooms = new RoomList("Holding Token's Rooms"),
        this.friendsRooms = new RoomList("Friends Rooms"),
        this.topRooms = new RoomList("Top Rooms"),
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
      .select()
      .eq("owner", UserManager.userWalletAddress);
    console.log(data);
  }

  private async loadHoldingTokenRooms(): Promise<void> {
    if (UserManager.userWalletAddress) {
      const { data } = await SupabaseManager.supabase.from("pal_tokens")
        .select();
      const tokenAddresses: string[] = data?.map((token) => token.address) ??
        [];
      const balances = await TokenHoldingsAggregatorContract.getERC20Balances(
        UserManager.userWalletAddress,
        tokenAddresses,
      );
      console.log(balances);
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
      .select()
      .order("last_fetched_price", { ascending: false })
      .limit(50);
    console.log(data);
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
