import {
  BodyNode,
  BrowserInfo,
  Confirm,
  DomNode,
  el,
  View,
  ViewParams,
} from "@common-module/app";
import ChatRoom from "../component/token-room/ChatRoom.js";
import RoomLoading from "../component/token-room/RoomLoading.js";
import RoomTitleBar from "../component/token-room/RoomTitleBar.js";
import TokenPurchaseForm from "../component/token-room/TokenPurchaseForm.js";
import SupabaseManager from "../SupabaseManager.js";
import UserManager from "../user/UserManager.js";

export default class TokenRoomView extends View {
  private container: DomNode;
  private titleBar: RoomTitleBar;
  private tokenPurchaseForm: TokenPurchaseForm;
  private chatRoom: ChatRoom;

  private currentTokenAddress: string | undefined;

  constructor(params: ViewParams) {
    super();

    BodyNode.append(
      this.container = el(
        ".token-room-view",
        this.titleBar = new RoomTitleBar(),
        this.chatRoom = new ChatRoom(),
        this.tokenPurchaseForm = new TokenPurchaseForm(),
      ),
    );

    this.titleBar.on(["buyToken", "sellToken"], () => {
      console.log(this.currentTokenAddress);
      if (this.currentTokenAddress) {
        this.loadRoomInfo(this.currentTokenAddress);
      }
    });

    this.chatRoom.on(["buyToken", "sellToken"], () => {
      console.log(this.currentTokenAddress);
      if (this.currentTokenAddress) {
        this.loadRoomInfo(this.currentTokenAddress);
      }
    });

    this.tokenPurchaseForm.on("buyToken", () => {
      console.log(this.currentTokenAddress);
      if (this.currentTokenAddress) {
        this.loadRoomInfo(this.currentTokenAddress);
      }
    });

    if (params.tokenAddress) {
      this.loadRoomInfo("0x" + params.tokenAddress);
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.setViewportHeight);
    }
  }

  private setViewportHeight = () => {
    if (BrowserInfo.isPhoneSize) {
      this.container.style({
        top: `${window.visualViewport!.offsetTop}px`,
        height: `${window.visualViewport!.height}px`,
      });
      this.chatRoom.scrollToBottom();
    }
  };

  public changeParams(params: ViewParams): void {
    if (params.tokenAddress) {
      this.loadRoomInfo("0x" + params.tokenAddress);
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
      }, async () => history.back());
    } else if (!UserManager.userWalletAddress) {
      new Confirm({
        title: "Connect Wallet",
        message: "You need to connect your wallet to view this room.",
      }, async () => {
        await UserManager.connectWallet();
        this.loadRoomInfo(tokenAddress);
      }, async () => history.back());
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
        this.checkWritePermission(tokenAddress),
        this.chatRoom.loadMessages(tokenAddress),
      ]);

      if (!formShowing) {
        this.chatRoom.focusMessageForm();
      }

      if (!this.closed) loading.delete();
    }
  }

  private async checkWritePermission(tokenAddress: string) {
    const { data, error } = await SupabaseManager.supabase.rpc(
      "check_write_granted",
      {
        parameter_token_address: tokenAddress,
      },
    );
    console.log(data);
    if (!error && data !== true) {
      this.chatRoom.hideMessageForm();
    } else {
      this.chatRoom.showMessageForm();
    }
  }

  public close(): void {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener(
        "resize",
        this.setViewportHeight,
      );
    }
    this.container.delete();
    super.close();
  }
}
