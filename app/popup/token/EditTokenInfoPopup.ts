import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Input,
  Popup,
} from "common-dapp-module";
import PalTokenContract from "../../contract/PalTokenContract.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";

export default class EditTokenInfoPopup extends Popup {
  public content: DomNode;

  private tokenNameInput: Input;
  private tokenSymbolInput: Input;
  private tokenDescriptionInput: Input;

  constructor(tokenInfo: TokenInfo) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".edit-token-info-popup",
        el("h1", "Edit Token Info"),
        el(
          "main",
          el(
            "form.token-name-form",
            { submit: (event) => event.preventDefault() },
            this.tokenNameInput = new Input({
              label: "Name (e.g. Pal Token)",
              placeholder: "Name",
              value: tokenInfo.name,
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    await new PalTokenContract(tokenInfo.token_address).setName(
                      this.tokenNameInput.value,
                    );

                    SupabaseManager.supabase.functions.invoke(
                      "get-room",
                      { body: { tokenAddress: tokenInfo.token_address } },
                    );

                    const newTokenInfo = structuredClone(tokenInfo);
                    newTokenInfo.name = this.tokenSymbolInput.value;
                    UserManager.setSignedUserToken(newTokenInfo);
                  } catch (error) {
                    console.error(error);
                  }

                  button.enable();
                  button.text = "Save";
                },
                title: "Save",
              }),
            ),
          ),
          el(
            "form.token-symbol-form",
            { submit: (event) => event.preventDefault() },
            this.tokenSymbolInput = new Input({
              label: "Symbol (e.g. PAL)",
              placeholder: "Symbol",
              value: tokenInfo.symbol,
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    await new PalTokenContract(tokenInfo.token_address)
                      .setSymbol(
                        this.tokenSymbolInput.value,
                      );

                    SupabaseManager.supabase.functions.invoke(
                      "get-room",
                      { body: { tokenAddress: tokenInfo.token_address } },
                    );

                    const newTokenInfo = structuredClone(tokenInfo);
                    newTokenInfo.symbol = this.tokenSymbolInput.value;
                    UserManager.setSignedUserToken(newTokenInfo);
                  } catch (error) {
                    console.error(error);
                  }

                  button.enable();
                  button.text = "Save";
                },
                title: "Save",
              }),
            ),
          ),
          el(
            "form.token-description-form",
            { submit: (event) => event.preventDefault() },
            this.tokenDescriptionInput = new Input({
              label: "Description",
              placeholder: "Description",
              value: tokenInfo.metadata.description,
              multiline: true,
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    const newTokenInfo = structuredClone(tokenInfo);
                    newTokenInfo.metadata.description =
                      this.tokenDescriptionInput.value;

                    await SupabaseManager.supabase.from("pal_tokens").update({
                      metadata: newTokenInfo.metadata,
                    }).eq("token_address", tokenInfo.token_address);

                    UserManager.setSignedUserToken(newTokenInfo);
                  } catch (error) {
                    console.error(error);
                  }

                  button.enable();
                  button.text = "Save";
                },
                title: "Save",
              }),
            ),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".done-button",
            click: () => this.delete(),
            title: "Done",
          }),
        ),
      ),
    );
  }
}
