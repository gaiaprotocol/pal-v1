import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
  Router,
} from "common-dapp-module";
import PalContract from "../../contract/PalContract.js";
import SupabaseManager from "../../SupabaseManager.js";

export default class CreateTokenPopup extends Popup {
  public content: DomNode;
  private createTokenButton: Button;
  private tokenNameInput: DomNode<HTMLInputElement>;
  private tokenSymbolInput: DomNode<HTMLInputElement>;
  private tokenDescriptionInput: DomNode<HTMLTextAreaElement>;

  constructor(
    callback: (name: string, symbol: string, metadata: {
      description?: string;
    }) => void,
  ) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".create-token-popup",
        el("h1", "Create Token"),
        el(
          "main",
          this.tokenNameInput = el("input", { placeholder: "Name" }),
          this.tokenSymbolInput = el("input", { placeholder: "Symbol" }),
          this.tokenDescriptionInput = el("textarea", {
            placeholder: "Description",
          }),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          this.createTokenButton = new Button({
            type: ButtonType.Text,
            tag: ".create-token-button",
            click: async () => {
              const tokenAddress = await PalContract.createToken(
                this.tokenNameInput.domElement.value,
                this.tokenSymbolInput.domElement.value,
              );
              const { data, error } = await SupabaseManager.supabase.functions
                .invoke("track-events");
              console.log(data, error);
              const { data: updateData, error: updateError } =
                await SupabaseManager.supabase.from("pal_tokens").update({
                  metadata: {
                    description: this.tokenDescriptionInput.domElement.value,
                  },
                }).eq("address", tokenAddress);
              console.log(updateData, updateError);
              this.delete();
              Router.go("/" + tokenAddress);
            },
            title: "Create Token",
          }),
        ),
      ),
    );
  }
}
