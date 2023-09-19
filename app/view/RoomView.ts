import {
  BodyNode,
  Confirm,
  DomNode,
  el,
  View,
  ViewParams,
} from "common-dapp-module";
import ChatRoom from "../component/room/ChatRoom.js";
import RoomLoading from "../component/room/RoomLoading.js";
import RoomTitleBar from "../component/room/RoomTitleBar.js";
import TokenPurchaseForm from "../component/room/TokenPurchaseForm.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";

export default class RoomView extends View {
  private container: DomNode;
  private titleBar: RoomTitleBar;
  private tokenPurchaseForm: TokenPurchaseForm;
  private chatRoom: ChatRoom;

  private currentTokenAddress: string | undefined;

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

    this.tokenPurchaseForm.on("buyToken", () => {
      if (this.currentTokenAddress) {
        this.loadRoomInfo(this.currentTokenAddress);
      }
    });

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
    this.currentTokenAddress = tokenAddress;

    if (!UserManager.user) {
      new Confirm({
        title: "Sign In",
        message: "You need to sign in to view this room.",
      }, async () => {
        await UserManager.signIn();
        this.loadRoomInfo(tokenAddress);
      });
    } else if (!UserManager.userWalletAddress) {
      new Confirm({
        title: "Connect Wallet",
        message: "You need to connect your wallet to view this room.",
      }, async () => {
        await UserManager.connectWallet();
        this.loadRoomInfo(tokenAddress);
      });
    } else {
      const loading = new RoomLoading().appendTo(this.container);

      this.titleBar.loadTokenInfo(tokenAddress);

      const now = Date.now();

      const { data: roomInfo, error } = await SupabaseManager.supabase.functions
        .invoke(
          "get-room",
          {
            body: {
              walletAddress: UserManager.userWalletAddress,
              tokenAddress,
            },
          },
        );

      if (roomInfo) {
        this.tokenPurchaseForm.loadProfileImage(
          roomInfo.owner,
          roomInfo.symbol,
        );
      }

      console.log("get-room time taken:", Date.now() - now);

      const [formShowing] = await Promise.all([
        this.tokenPurchaseForm.check(tokenAddress),
        this.chatRoom.loadMessages(tokenAddress),
      ]);

      if (!formShowing) {
        this.chatRoom.focusMessageForm();
      }

      if (!this.closed) loading.delete();
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
