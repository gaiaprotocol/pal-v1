import { DomNode, el, View } from "@common-module/app";
import TokenInfoCacher from "../cacher/TokenInfoCacher.js";
import RoomList from "../component/rooms/RoomList.js";
import Constants from "../Constants.js";
import TokenHoldingsAggregatorContract from "../contract/TokenHoldingsAggregatorContract.js";
import TokenInfo from "../data/TokenInfo.js";
import FavoriteManager from "../FavoriteManager.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";
import Layout from "./Layout.js";

export default class Rooms extends View {
  private container: DomNode;

  private myRooms: RoomList;
  private favoriteRooms: RoomList;
  private holdingRooms: RoomList;
  //private friendsRooms: RoomList;
  private topRooms: RoomList;
  private newRooms: RoomList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".rooms-view",
        el(
          ".rooms",
          this.myRooms = new RoomList("My Rooms"),
          this.favoriteRooms = new RoomList("Favorite Rooms"),
          this.holdingRooms = new RoomList("Holding Token's Rooms"),
          //this.friendsRooms = new RoomList("Friends Rooms"),
          this.topRooms = new RoomList("Top Rooms"),
          this.newRooms = new RoomList("New Rooms"),
        ),
      ),
    );

    this.loadRooms();

    this.container.onDelegate(
      FavoriteManager,
      "add",
      async (tokenAddress: string) => {
        const tokenInfo = await TokenInfoCacher.get(tokenAddress);
        if (tokenInfo) {
          this.favoriteRooms.add(tokenInfo);
        }
      },
    );

    this.container.onDelegate(
      FavoriteManager,
      "remove",
      (tokenAddress: string) => {
        this.favoriteRooms.findItem(tokenAddress)?.delete();
      },
    );

    this.container.onDelegate(
      UserManager,
      "userTokenChanged",
      () => this.loadMyTokenRooms(),
    );
  }

  private async loadRooms() {
    const results = await Promise.all([
      this.loadMyTokenRooms(),
      this.loadFavoriteRooms(),
      this.loadHoldingTokenRooms(),
      this.loadFriendsTokenRooms(),
      this.loadTopRooms(),
      this.loadNewRooms(),
    ]);

    const array = results.flat();
    const tokens = array.filter((obj, idx) => {
      const isFirstFindIdx = array.findIndex((obj2) =>
        obj2.token_address === obj.token_address
      );
      return isFirstFindIdx === idx;
    });

    TokenInfoCacher.cache(tokens);
    SupabaseManager.supabase.functions.invoke(
      "refresh-token-prices-and-balances",
      {
        body: {
          tokenAddresses: tokens.map((token: any) => token.token_address),
        },
      },
    );
  }

  private async loadMyTokenRooms(): Promise<TokenInfo[]> {
    const { data } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      )
      .eq("owner", UserManager.userWalletAddress)
      .neq("hiding", true);
    if (data) {
      this.myRooms.rooms = data as any;
      return data as any;
    }
    return [];
  }

  private async loadFavoriteRooms(): Promise<TokenInfo[]> {
    if (UserManager.user) {
      const { data } = await SupabaseManager.supabase.from("pal_tokens")
        .select(
          Constants.PAL_TOKENS_SELECT_QUERY,
        )
        .in("token_address", FavoriteManager.favoriteTokenAddresses);
      if (data) {
        this.favoriteRooms.rooms = data as any;
        return data as any;
      }
    }
    this.favoriteRooms.loaded();
    return [];
  }

  private async loadHoldingTokenRooms(): Promise<TokenInfo[]> {
    if (UserManager.userWalletAddress) {
      const { data } = await SupabaseManager.supabase.from("pal_tokens")
        .select(
          Constants.PAL_TOKENS_SELECT_QUERY,
        )
        .neq("hiding", true);
      if (data) {
        const tokenAddresses: string[] = (data as any)?.map((token: any) =>
          token.token_address
        ) ??
          [];
        console.log(UserManager.userWalletAddress, tokenAddresses);
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

        this.holdingRooms.loaded();
        return data as any;
      }
    }

    this.holdingRooms.loaded();
    return [];
  }

  private async loadFriendsTokenRooms(): Promise<TokenInfo[]> {
    //TODO: Implement after profit is generated
    /*const { data, error } = await SupabaseManager.supabase.functions.invoke(
      "get-friends",
    );
    console.log(data, error);*/
    return [];
  }

  private async loadTopRooms(): Promise<TokenInfo[]> {
    const { data } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      )
      .neq("hiding", true)
      .order("last_fetched_price", { ascending: false })
      .limit(10);
    if (data) {
      this.topRooms.rooms = data as any;
      return data as any;
    }
    return [];
  }

  private async loadNewRooms(): Promise<TokenInfo[]> {
    const { data } = await SupabaseManager.supabase.from("pal_tokens")
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      )
      .neq("hiding", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      this.newRooms.rooms = data as any;
      return data as any;
    }
    return [];
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
