import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Input,
  Popup,
} from "common-dapp-module";
import { ethers } from "ethers";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import PalUserTokenContract from "../../contract/PalUserTokenContract.js";
import TokenInfo from "../../data/TokenInfo.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";

export default class EditTokenInfoPopup extends Popup {
  public content: DomNode;

  private tokenNameInput: Input;
  private tokenSymbolInput: Input;
  private tokenDescriptionInput: Input;
  private viewTokenRequiredInput: Input;
  private writeTokenRequiredInput: Input;

  private currentTokenMetadata: any;

  constructor(private tokenAddress: string) {
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
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    await new PalUserTokenContract(tokenAddress).setName(
                      this.tokenNameInput.value,
                    );
                    SupabaseManager.supabase.functions.invoke("get-room", {
                      body: {
                        walletAddress: UserManager.userWalletAddress,
                        tokenAddress,
                      },
                    });
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
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    await new PalUserTokenContract(tokenAddress).setSymbol(
                      this.tokenSymbolInput.value,
                    );
                    SupabaseManager.supabase.functions.invoke("get-room", {
                      body: {
                        walletAddress: UserManager.userWalletAddress,
                        tokenAddress,
                      },
                    });
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
              multiline: true,
            }),
            this.viewTokenRequiredInput = new Input({
              label: "View Token Required",
              placeholder: "View Token Required",
              required: true,
            }),
            this.writeTokenRequiredInput = new Input({
              label: "Write Token Required",
              placeholder: "Write Token Required",
              required: true,
            }),
            el(
              "footer",
              new Button({
                click: async (event, button) => {
                  button.disable();
                  button.text = "Saving...";

                  try {
                    const metadata = structuredClone(this.currentTokenMetadata);
                    metadata.description = this.tokenDescriptionInput.value;

                    await SupabaseManager.supabase.from("pal_tokens").update({
                      metadata,
                      view_token_required: ethers.parseEther(
                        this.viewTokenRequiredInput.value,
                      ).toString(),
                      write_token_required: ethers.parseEther(
                        this.writeTokenRequiredInput.value,
                      ).toString(),
                    }).eq("token_address", tokenAddress);
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
    this.load();
  }

  private async load() {
    const tokenInfo = await TokenInfoCacher.get(this.tokenAddress);
    if (tokenInfo) {
      this.displayTokenInfo(tokenInfo);
    }
  }

  private displayTokenInfo(tokenInfo: TokenInfo) {
    this.tokenNameInput.value = tokenInfo.name;
    this.tokenSymbolInput.value = tokenInfo.symbol;
    this.tokenDescriptionInput.value = tokenInfo.metadata.description ?? "";
    this.viewTokenRequiredInput.value = ethers.formatEther(
      tokenInfo.view_token_required,
    );
    this.writeTokenRequiredInput.value = ethers.formatEther(
      tokenInfo.write_token_required,
    );

    this.currentTokenMetadata = tokenInfo.metadata;
  }
}
