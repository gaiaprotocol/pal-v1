import { BodyNode, DomNode, el, View, ViewParams } from "common-dapp-module";
import ChatRoom from "../component/room/ChatRoom.js";
import RoomTitleBar from "../component/room/RoomTitleBar.js";
import TokenPurchaseForm from "../component/room/TokenPurchaseForm.js";
import RoomInfo from "../data/RoomInfo.js";
import SupabaseManager from "../SupabaseManager.js";

export default class RoomView extends View {
  private container: DomNode;
  private titleBar: RoomTitleBar;
  private tokenPurchaseForm: TokenPurchaseForm;
  private chatRoom: ChatRoom;

  private roomInfo: RoomInfo | undefined;

  constructor(params: ViewParams) {
    super();

    BodyNode.append(
      this.container = el(
        ".room-view",
        this.titleBar = new RoomTitleBar(),
        this.chatRoom = new ChatRoom(),
        this.tokenPurchaseForm = new TokenPurchaseForm(),
      ),
    );
    if (params.tokenAddress) {
      this.loadRoomInfo(params.tokenAddress);
    }
  }

  public changeParams(params: ViewParams): void {
    if (params.tokenAddress) {
      this.loadRoomInfo(params.tokenAddress);
    }
  }

  private async loadRoomInfo(tokenAddress: string) {
    const { data, error } = await SupabaseManager.supabase.functions.invoke(
      "get-room",
      { body: { tokenAddress } },
    );
    this.roomInfo = data;
    if (this.roomInfo) {
      this.titleBar.loadTokenInfo(tokenAddress);
      this.tokenPurchaseForm.check(tokenAddress, this.roomInfo);
      this.chatRoom.loadMessages(tokenAddress);
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
