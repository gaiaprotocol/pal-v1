import { ArrayUtil, DomNode, el } from "@common-module/app";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import ListLoading from "../ListLoading.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  private list: DomNode;
  private loadingComponent: ListLoading | undefined;
  private items: RoomItem[] = [];

  constructor(title: string) {
    super(".room-list");
    this.append(
      el("header", title),
      this.list = el("ul", this.loadingComponent = new ListLoading()),
    );
    this.loadingComponent.on("delete", () => this.loadingComponent = undefined);

    this.onDelegate(
      TokenInfoCacher,
      "tokenInfoChanged",
      (tokenInfo: TokenInfo) => {
        const item = this.findItem(tokenInfo.token_address);
        if (item) {
          item.load(tokenInfo);
        }
      },
    );
  }

  public loaded() {
    this.loadingComponent?.delete();
  }

  public add(room: TokenInfo): RoomItem {
    const item = new RoomItem(room).appendTo(this.list);
    this.items.push(item);
    item.on("delete", () => ArrayUtil.pull(this.items, item));

    this.loaded();
    return item;
  }

  public set rooms(rooms: TokenInfo[]) {
    this.list.empty();
    for (const room of rooms) {
      this.add(room);
    }
  }

  public findItem(tokenAddress: string) {
    return this.items.find((item) => item.currentTokenAddress === tokenAddress);
  }
}
