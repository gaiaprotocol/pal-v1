import { DomNode, el, ListLoadingBar, Store } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenService from "../token/TokenService.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import GeneralChatRoomListItem from "./GeneralChatRoomListItem.js";
import TokenChatRoomListItem from "./TokenChatRoomListItem.js";

export default class ChatRoomList extends DomNode {
  private store = new Store("chat-room-list");
  private list: DomNode;
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".chat-room-list");
    this.append(new GeneralChatRoomListItem(), this.list = el("main"));

    const cachedTokens = this.store.get<Token[]>("cached-tokens");
    if (cachedTokens && cachedTokens.length > 0) {
      for (const t of cachedTokens) {
        this.list.append(new TokenChatRoomListItem(t));
      }
    }

    this.refresh();
  }

  private async refresh() {
    const walletAddress = PalSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      this.list.append(new ListLoadingBar());

      const tokens = await TokenService.fetchHeldOrOwnedTokens(
        walletAddress,
        this.lastCreatedAt,
      );
      this.store.set("cached-tokens", tokens, true);

      if (!this.deleted) {
        this.list.empty();
        for (const t of tokens) {
          this.list.append(new TokenChatRoomListItem(t));
        }
        this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
      }
    }
  }
}
