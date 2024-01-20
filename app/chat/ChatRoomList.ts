import { DomNode, ListLoadingBar, Store } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenService from "../token/TokenService.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatRoomListItem from "./GeneralChatRoomListItem.js";
import TokenChatRoomListItem from "./TokenChatRoomListItem.js";

export default class ChatRoomList extends DomNode {
  private store: Store;
  private tokenChatRoomListItems: TokenChatRoomListItem[] = [];
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".chat-room-list");
    this.append(new GeneralChatRoomListItem());

    this.store = new Store("chat-room-list");

    const cachedTokens = this.store.get<Token[]>("cached-tokens");
    if (cachedTokens && cachedTokens.length > 0) {
      for (const t of cachedTokens) {
        const item = new TokenChatRoomListItem(t).appendTo(this);
        this.tokenChatRoomListItems.push(item);
      }
    }

    this.refresh();
  }

  private async refresh() {
    const walletAddress = PalSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      const loadingBar = new ListLoadingBar().appendTo(this);

      const tokens = await TokenService.fetchHeldOrOwnedTokens(
        walletAddress,
        this.lastCreatedAt,
      );
      this.store.set("cached-tokens", tokens);

      if (!this.deleted) {
        loadingBar.delete();
        for (const i of this.tokenChatRoomListItems) {
          i.delete();
        }
        this.tokenChatRoomListItems = [];
        for (const t of tokens) {
          const item = new TokenChatRoomListItem(t).appendTo(this);
          this.tokenChatRoomListItems.push(item);
        }
        this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
      }
    }
  }
}
