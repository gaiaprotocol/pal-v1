import { DomNode, el, View } from "common-dapp-module";
import TokenHoldingsAggregatorContract from "../contract/TokenHoldingsAggregatorContract.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";

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
        el("ul.room-list", el("li", "test")),
        this.myRooms = el("ul.room-list", el("li", "test")),
        this.holdingRooms = el("ul.room-list", el("li", "test")),
        this.friendsRooms = el("ul.room-list", el("li", "test")),
        this.topRooms = el("ul.room-list", el("li", "test")),
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
  }

  private async loadHoldingTokenRooms(): Promise<void> {
    console.log(UserManager.userWalletAddress);
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
  }

  private async loadTopRooms(): Promise<void> {
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
