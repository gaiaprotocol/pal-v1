import { BodyNode, DomNode, el, View, ViewParams } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";

export default class ChatRoom extends View {
  private container: DomNode;

  constructor(params: ViewParams) {
    super();
    BodyNode.append(
      this.container = el(
        ".chat-room-view",
        el("header", el("h1", "Chat Room")),
        "test",
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
    console.log(data, error);

    const { data: checkViewGrantedData, error: checkViewGrantedError } =
      await SupabaseManager.supabase.rpc("check_view_granted", {
        token_address: tokenAddress,
      });
    console.log(checkViewGrantedData, checkViewGrantedError);

    const { data: chatMessagesData, error: chatMessagesError } =
      await SupabaseManager.supabase.from("chat_messages")
        .select().eq(
          "token_address",
          tokenAddress,
        );
    console.log(chatMessagesData, chatMessagesError);
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
