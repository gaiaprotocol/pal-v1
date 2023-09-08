import { BodyNode, DomNode, el, View, ViewParams } from "common-dapp-module";
import ChatRoom from "../component/room/ChatRoom.js";
import RoomDashboard from "../component/room/RoomDashboard.js";
import RoomTitleBar from "../component/room/RoomTitleBar.js";
import Tabs from "../component/room/RoomTabs.js";
import TokenPurchaseForm from "../component/room/TokenPurchaseForm.js";
import UserList from "../component/room/RoomUserList.js";
import RoomInfo from "../data/RoomInfo.js";
import SupabaseManager from "../SupabaseManager.js";

export default class RoomView extends View {
  private container: DomNode;
  private titleBar: RoomTitleBar;
  private tokenPurchaseForm: TokenPurchaseForm;
  private chatRoom: ChatRoom;
  private dashboard: RoomDashboard;
  private userList: UserList;

  private roomInfo: RoomInfo | undefined;

  constructor(params: ViewParams) {
    super();
    BodyNode.append(
      this.container = el(
        ".room-view",
        this.titleBar = new RoomTitleBar(),
        new Tabs(),
        el(
          "main",
          this.chatRoom = new ChatRoom(),
          this.dashboard = new RoomDashboard(),
        ),
        this.userList = new UserList(),
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
