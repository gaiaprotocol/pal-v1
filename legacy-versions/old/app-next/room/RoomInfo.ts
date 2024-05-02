export enum RoomType {
  REGULAR,
  TOKEN,
}

export interface RegularRoomInfo {
  type: RoomType.REGULAR;
  topic: string;
  uri: string;
}

export interface TokenRoomInfo {
  type: RoomType.TOKEN;
  chain: string;
  tokenAddress: string;
}

type RoomInfo = RegularRoomInfo | TokenRoomInfo;
export default RoomInfo;
