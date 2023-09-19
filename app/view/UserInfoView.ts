import { DomNode, el, View, ViewParams } from "common-dapp-module";
import SupabaseManager from "../SupabaseManager.js";
import Layout from "./Layout.js";

export default class UserInfoView extends View {
  private container: DomNode;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".user-info-view",
      ),
    );
    if (params.xUsername) {
      this.loadXUser(params.xUsername);
    }
  }

  public changeParams(params: ViewParams): void {
    if (params.xUsername) {
      this.loadXUser(params.xUsername);
    }
  }

  private async loadXUser(xUsername: string): Promise<void> {
    const { data, error } = await SupabaseManager.supabase.from("user_details")
      .select("*")
      .eq("metadata ->> xUsername", xUsername).single();
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      this.container.append(
        el(
          "h1",
          data.metadata.xUsername,
        ),
      );
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
