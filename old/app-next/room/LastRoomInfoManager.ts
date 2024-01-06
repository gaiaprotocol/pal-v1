import RoomInfo, { RoomType } from "./RoomInfo.js";

class LastRoomInfoManager {
  public lastRoomInfo: RoomInfo | undefined;

  public get lastRoomUri(): string {
    if (this.lastRoomInfo) {
      switch (this.lastRoomInfo.type) {
        case RoomType.REGULAR:
          return `/${this.lastRoomInfo.uri}`;
        case RoomType.TOKEN:
          return `/${this.lastRoomInfo.chain}/${this.lastRoomInfo.tokenAddress}`;
      }
    }
    return "/";
  }
}

export default new LastRoomInfoManager();
